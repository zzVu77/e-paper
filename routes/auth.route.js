import express from "express";
import passport from "passport";
import authController from "../auth/controllers/authController.js";

const router = express.Router();

// Local authentication
router.post("/local/login", authController.login);
// Google authentication
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), authController.authCallback);

// GitHub authentication
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/github/callback", passport.authenticate("github", { failureRedirect: "/login" }), authController.authCallback);

// Logout
router.post("/logout", authController.logout);

export default router;
