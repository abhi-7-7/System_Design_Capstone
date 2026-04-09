// // src/services/userApiService.ts

// import axios, { AxiosError } from 'axios';
// import api from '../api/axios'; // Assuming this is your configured axios instance

// /**
//  * Interface for the expected API response structure.
//  */
// export interface UserProfileResponse {
//     message: string;
// }

// /**
//  * Fetches user profile data securely using an access token.
//  * @param accessToken The authentication token from localStorage.
//  * @returns A promise resolving to the user's message or null on failure.
//  */
// export const fetchUserProfile = async (accessToken: string): Promise<string | null> => {
//     if (!accessToken) {
//         throw new Error("Authentication token required.");
//     }

//     try {
//         const response = await api.get<UserProfileResponse>("/user/me", {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//         });
//         return response.data?.message || null;
//     } catch (error) {
//         // Type guarding for network or API specific errors
//         const apiError = error as AxiosError;

//         if (apiError.response?.status === 401) {
//             console.warn("Authentication failure: Token expired/invalid.");
//             localStorage.removeItem("accessToken");
//             throw new Error("Unauthorized access. Please log in again.");
//         }
        
//         // Generic error handling for network issues, etc.
//         console.error("API Call Failed:", apiError);
//         throw new Error("Failed to load user profile. Check connection or try again.");
//     }
// };

// /**
//  * Helper type guard check for Axios errors.
//  */
// export function isAxiosError(error: unknown): error is AxiosError {
//     return axios.isAxiosError(error);
// }


// <----------------------------------------------------------------------------------------------------->

// src/services/userApiService.ts

import axios from 'axios';
import type { AxiosError } from 'axios';
import apiInstance from '../api/axios'; // Assuming this is your configured axios instance

/**
 * Defines the expected structure for the API response data.
 */
export interface UserProfileResponse {
    message: string;
}

// --- Type Guarding Utility ---

/**
 * Helper function to validate if an unknown object is a valid AxiosError.
 * @param error The potential error object.
 * @returns True if the error is an AxiosError.
 */
export function isAxiosError(error: unknown): error is AxiosError {
    return axios.isAxiosError(error);
}

/**
 * Manages secure communication and retrieval of user profile data via API calls.
 * This class encapsulates token management, dependency injection, and business logic.
 */
export class UserApiService {
    private readonly api: typeof apiInstance;

    constructor(apiClient: typeof apiInstance = apiInstance) {
        this.api = apiClient;
    }

    /**
     * Retrieves the current access token from local storage.
     * @returns The stored authentication token, or null if missing.
     */
    private getAccessToken(): string | null {
        return localStorage.getItem("accessToken");
    }

    /**
     * Fetches and processes the user's profile data using an authenticated API request.
     * Handles specific error paths like unauthorized access (401).
     * 
     * @returns A promise resolving to the user's message string, or null on success but missing data.
     * @throws {Error} If authentication fails, connection issues occur, or required token is absent.
     */
    public async getProfile(): Promise<string> {
        const accessToken = this.getAccessToken();

        if (!accessToken) {
            throw new Error("Authentication token required.");
        }

        try {
            const response = await this.api.get<UserProfileResponse>("user/me", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data?.message ?? ''; 
        } catch (error) {
            const apiError = error as AxiosError<{ message?: string; error?: string }>;

            if (apiError.response) {
                const status = apiError.response.status;
                const message = apiError.response.data?.message || apiError.response.data?.error || "Unknown server error";
                
                if (status === 401 || status === 403) {
                    console.warn(`[Auth] Session issue (${status}). Token may be expired.`);
                    // We don't remove the token here because the axios interceptor might be trying to refresh it.
                    // If the refresh fails, the interceptor will handle the logout.
                    throw new Error("Session issue. Attempting to restore access...");
                }
                
                throw new Error(`Server Error (${status}): ${message}`);
            } else if (apiError.request) {
                throw new Error("No response from server. Please check if your backend is running on port 3000.");
            } else {
                throw new Error(`Request setup failed: ${apiError.message}`);
            }
        }
    }
}

/**
 * Backward-compatible functional API used by hooks/components.
 */
export const fetchUserProfile = async (_accessToken?: string): Promise<string | null> => {
    const service = new UserApiService();
    const message = await service.getProfile();
    return message || null;
};
