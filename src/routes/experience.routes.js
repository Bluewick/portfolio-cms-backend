import express from "express";
import { list_experiences, create_experience, update_experience, delete_experience, batch_reorder_experiences } from "../controllers/experience.controller.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";

export const public_experience_router = express.Router();
export const admin_experience_router = express.Router();

// Public: GET /api/experiences
public_experience_router.get("/", list_experiences);

// Admin: /api/admin/experiences
admin_experience_router.use(authenticate_user, authorize("admin"));
admin_experience_router.get("/", list_experiences);
admin_experience_router.post("/", create_experience);
admin_experience_router.patch("/reorder", batch_reorder_experiences);
admin_experience_router.put("/:id", update_experience);
admin_experience_router.delete("/:id", delete_experience);