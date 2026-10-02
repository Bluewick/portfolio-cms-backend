import express from "express";
import { list_testimonials, create_testimonial, update_testimonial, delete_testimonial, batch_reorder_testimonials } from "../controllers/testimonial.controller.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";

export const public_testimonial_router = express.Router();
export const admin_testimonial_router = express.Router();

// Public: GET /api/testimonials
public_testimonial_router.get("/", list_testimonials);

// Admin: /api/admin/testimonials
admin_testimonial_router.use(authenticate_user, authorize("admin"));
admin_testimonial_router.get("/", list_testimonials);
admin_testimonial_router.post("/", create_testimonial);
admin_testimonial_router.patch("/reorder", batch_reorder_testimonials);
admin_testimonial_router.put("/:id", update_testimonial);
admin_testimonial_router.delete("/:id", delete_testimonial);