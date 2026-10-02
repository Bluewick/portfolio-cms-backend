import express from "express";
import { get_presigned_url } from "../controllers/media.controller.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Role-gated upload URL generator: Admin only
router.post("/presigned-url", authenticate_user, authorize("admin"), get_presigned_url);

export default router;