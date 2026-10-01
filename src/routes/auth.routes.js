import express from "express";
import { login, get_me } from "../controllers/auth.controller.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";
import { auth_rate_limiter } from "../middleware/rate_limiter.middleware.js";

const router = express.Router();

// Public Authentication Route (Rate-limited)
router.post("/login", auth_rate_limiter, login);

// Protected Admin Self Profile
router.get("/me", authenticate_user, authorize("admin"), get_me);

export default router;