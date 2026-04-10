import express, { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

/**
 * Builds authentication routes with an injected controller instance.
 */
export const setupAuthRoutes = (authController: AuthController): Router => {
    const router = Router();

    router.use(express.json());

    // Bind methods to preserve `this` inside AuthController.
    router.get("/debug", (req, res) => {
        res.send("Server OK");
    });

    router.get("/ping", (req, res) => {
        res.send("AUTH WORKING");
    });

    router.get("/login", (req, res) => {
        res.status(405).json({
            error: "Method Not Allowed",
            message: "Use POST /api/auth/login with email and password in JSON body.",
        });
    });

    router.post("/register", authController.register.bind(authController));
    router.post("/login", authController.login.bind(authController));
    router.post("/refresh", authController.refresh.bind(authController));
    router.post("/logout", authController.logout.bind(authController));

    return router;
    
};
const authController = new AuthController();
const authRouter = setupAuthRoutes(authController);

export default authRouter;
