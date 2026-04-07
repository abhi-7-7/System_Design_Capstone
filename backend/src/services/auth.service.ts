import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

type UserRecord = {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    name: string | null;
};

// --- 1. Custom Error Handling (Expert Level) ---

/**
 * @class AuthError
 * @description Custom error class for all authentication failures, allowing client-side code to distinguish between different failure states.
 */
export class AuthError extends Error {
    private statusCode: number;

    constructor(message: string, statusCode: number = 401) {
        super(message);
        this.statusCode = statusCode;
        // Ensures the correct prototype chain for custom errors
        Object.setPrototypeOf(this, AuthError.prototype);
    }

    public getCode(): number {
        return this.statusCode;
    }
}


// --- 2. Constants and Secrets Management ---

/**
 * @interface TokenPayload
 * @description Defines the expected payload structure for JWTs.
 */
export interface TokenPayload {
    userId: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * @typedef {Object} AuthTokens
 * @property {string} accessToken - The short-lived access token.
 * @property {string} refreshToken - The long-lived refresh token.
 */

// Use dedicated constants for expiry times and secrets
const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

// Time calculations (Avoid magic numbers)
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds


/**
 * @class AuthService
 * @description Handles all core authentication logic using best practices like token rotation,
 * explicit type handling, and custom error management.
 * All methods are static.
 */
export class AuthService {

    // --- Private Helper Methods (Encapsulation) ---

    /**
     * Generates a new JWT pair (Access and Refresh) for a given user ID.
     * @param {string} userId - The ID of the user.
     * @returns {{accessToken: string; refreshToken: string}} The new token pair.
     */
    private static generateTokens(userId: string): { accessToken: string; refreshToken: string } {
        const newAccessToken = jwt.sign(
            { userId },
            ACCESS_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        // Note: We sign the RT here, but we will store it separately in the DB.
        const newRefreshToken = jwt.sign(
            { userId },
            REFRESH_SECRET,
            { expiresIn: `${Math.floor(REFRESH_TOKEN_EXPIRY / 1000)}s` } // Use seconds for JWT expiry string
        );

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }


    // --- Public API Methods ---

    /**
     * Registers a new user in the system.
     * @param {string} email - The unique email address of the new user.
     * @param {string} password - The plain text password for the new user.
     * @param {string} [name] - Optional full name of the user.
     * @returns {Promise<UserRecord>} The newly created user record from the database.
     * @throws {AuthError} If a unique constraint violation occurs (e.g., email already exists).
     */
    static async register(email: string, password: string, name?: string): Promise<UserRecord> {
        // Hash the plain text password using bcrypt for secure storage (salt round 10).
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await prisma.user.create({
                data: { email, password: hashedPassword, name },
            });
            return user as UserRecord;
        } catch (error) {
            // Check for common unique constraint errors from Prisma
            if (typeof error === 'object' && error !== null && 'code' in error && (error.code === 'P2002')) {
                 throw new AuthError(`The email address ${email} is already registered.`, 409); // Conflict status code
            }
            // Re-throw other unexpected database errors
            throw new AuthError("Registration failed due to a system error.", 500);
        }
    }

    /**
     * Authenticates a user and generates a secure token pair, storing the Refresh Token.
     * @param {string} email - The user's registered email address.
     * @param {string} password - The plain text password provided by the user.
     * @returns {Promise<AuthTokens>} An object containing the newly generated tokens.
     * @throws {AuthError} If the credentials are invalid or a system error occurs.
     */
    static async login(email: string, password: string): Promise<AuthTokens> {
        // 1. Find the user by email
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new AuthError("Invalid credentials.", 401);
        }

        // 2. Compare provided password with stored hash
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new AuthError("Invalid credentials.", 401);
        }

        // 3. Generate JWTs and get the payload
        const { accessToken, refreshToken: generatedRefreshToken } = this.generateTokens(user.id);

        // 4. Store the Refresh Token in the database (Token Rotation on Login)
        const sevenDaysFromNow = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
        await prisma.refreshToken.create({
            data: {
                token: generatedRefreshToken,
                userId: user.id,
                expiresAt: sevenDaysFromNow,
            },
        });

        return { accessToken: accessToken, refreshToken: generatedRefreshToken };
    }

    /**
     * Refreshes an expired Access Token using a valid stored Refresh Token (Token Rotation).
     * This method deletes the old refresh token and issues a brand new pair.
     * @param {string} oldToken - The client's current Refresh Token.
     * @returns {Promise<{accessToken: string; refreshToken: string}>} A new, active token pair.
     * @throws {AuthError} If the refresh token is invalid, expired, or not found.
     */
    static async refresh(oldToken: string): Promise<AuthTokens> {
        // 1. Database Lookup & Validation (The original logic)
        const stored = await prisma.refreshToken.findUnique({
            where: { token: oldToken },
        });

        if (!stored) {
            throw new AuthError("Invalid refresh token.", 403); // Forbidden, as it's not recognized
        }

        // 2. Check for database-level expiration first (Critical security check)
        if (stored.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { token: oldToken } }); // Clean up expired record immediately
            throw new AuthError("Refresh token has expired.", 401);
        }

        // 3. Verify the JWT signature and payload
        let payload: JwtPayload;
        try {
             payload = jwt.verify(oldToken, REFRESH_SECRET) as JwtPayload;
        } catch (e) {
            // Catch JWT specific verification errors (e.g., corrupted token or secret mismatch)
            await prisma.refreshToken.delete({ where: { token: oldToken } }); // Clean up invalid record
            throw new AuthError("Invalid refresh token payload.", 403);
        }

        const userId = payload.userId;

        // --- TOKEN ROTATION (CORE LOGIC CHANGE) ---
        try {
             // a) Delete the old, used Refresh Token
            await prisma.refreshToken.delete({ where: { token: oldToken } });

            // b) Generate and store new tokens
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = this.generateTokens(userId);

            // c) Store the brand new Refresh Token in the database
            const sevenDaysFromNow = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
            await prisma.refreshToken.create({
                data: {
                    token: newRefreshToken,
                    userId: userId,
                    expiresAt: sevenDaysFromNow,
                },
            });

            // d) Return the full, refreshed pair (AT + RT)
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error) {
             throw new AuthError("Failed to complete token rotation.", 500);
        }
    }


    /**
     * Clears the client's session by deleting the associated Refresh Token from the database.
     * @param {string} token - The refresh token provided by the client.
     * @returns {Promise<void>} Resolves upon successful deletion of the token record.
     * @throws {AuthError} If the token was not found or if a system error occurs.
     */
    static async logout(token: string): Promise<void> {
        // 1. Attempt to delete the unique token record from the database.
        try {
            await prisma.refreshToken.delete({
                where: { token: token },
            });
            // Success - nothing needs to be returned, void is appropriate.
            return;
        } catch (error) {
            // Prisma throws an error if the record does not exist (P2025).
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
                // The session was already logged out or the token was invalidly provided, treat as success/safe failure.
                console.warn("Logout attempt with non-existent token:", token);
                return; 
            }
            // Re-throw other unexpected database errors
            throw new AuthError("Failed to log out due to a system error.", 500);
        }
    }
}

