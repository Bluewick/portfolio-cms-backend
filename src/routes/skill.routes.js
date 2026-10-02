import express from "express";
import { list_skills, create_skill, update_skill, delete_skill, batch_reorder_skills } from "../controllers/skill.controller.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";

export const public_skill_router = express.Router();
export const admin_skill_router = express.Router();

// Public: GET /api/skills
public_skill_router.get("/", list_skills);

// Admin: /api/admin/skills
admin_skill_router.use(authenticate_user, authorize("admin"));
admin_skill_router.get("/", list_skills);
admin_skill_router.post("/", create_skill);
admin_skill_router.patch("/reorder", batch_reorder_skills);
admin_skill_router.put("/:id", update_skill);
admin_skill_router.delete("/:id", delete_skill);