import express from "express";
import {
  list_public_projects,
  get_public_project,
  list_admin_projects,
  get_admin_project,
  create_project_handler,
  update_project_handler,
  delete_project_handler,
  reorder_projects_handler,
} from "../controllers/project.controller.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";

export const public_project_router = express.Router();
export const admin_project_router = express.Router();

// Public Routes
public_project_router.get("/", list_public_projects);
public_project_router.get("/:slug", get_public_project);

// Admin Routes (Gated by JWT & Admin Role)
admin_project_router.use(authenticate_user, authorize("admin"));
admin_project_router.get("/", list_admin_projects);
admin_project_router.post("/", create_project_handler);
admin_project_router.patch("/reorder", reorder_projects_handler);
admin_project_router.get("/:id", get_admin_project);
admin_project_router.put("/:id", update_project_handler);
admin_project_router.delete("/:id", delete_project_handler);