import express from "express";
import {
  list_public_blogs,
  get_public_blog,
  list_admin_blogs,
  get_admin_blog,
  create_blog_handler,
  update_blog_handler,
  delete_blog_handler,
} from "../controllers/blog.controller.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";

export const public_blog_router = express.Router();
export const admin_blog_router = express.Router();

// Public Routes
public_blog_router.get("/", list_public_blogs);
public_blog_router.get("/:slug", get_public_blog);

// Admin Routes (JWT & Admin Role Protected)
admin_blog_router.use(authenticate_user, authorize("admin"));
admin_blog_router.get("/", list_admin_blogs);
admin_blog_router.post("/", create_blog_handler);
admin_blog_router.get("/:id", get_admin_blog);
admin_blog_router.put("/:id", update_blog_handler);
admin_blog_router.delete("/:id", delete_blog_handler);