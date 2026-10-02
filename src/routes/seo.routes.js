import express from "express";
import { handle_blog_seo, handle_project_seo } from "../controllers/seo.controller.js";

const router = express.Router();

// Public Dynamic Detail Interceptors
router.get("/blogs/:slug", handle_blog_seo);
router.get("/projects/:slug", handle_project_seo);

export default router;