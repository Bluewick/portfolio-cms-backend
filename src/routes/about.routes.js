import express from "express";
import { get_about_data, update_about_data } from "../controllers/about.controller.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";

export const public_about_router = express.Router();
export const admin_about_router = express.Router();

// Public: GET /api/about
public_about_router.get("/", get_about_data);

// Admin: PUT /api/admin/about
admin_about_router.put("/", authenticate_user, authorize("admin"), update_about_data);