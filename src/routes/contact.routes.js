import express from "express";
import {
  submit_contact_form,
  list_inbox_messages,
  update_message_status,
  delete_inbox_message,
} from "../controllers/contact.controller.js";
import { contact_rate_limiter } from "../middleware/contact_limiter.middleware.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";

export const public_contact_router = express.Router();
export const admin_contact_router = express.Router();

// Public Contact Form Submission (Protected by strict rate limiter)
public_contact_router.post("/", contact_rate_limiter, submit_contact_form);

// Admin Inbox Routes (JWT & Admin Role Protected)
admin_contact_router.use(authenticate_user, authorize("admin"));
admin_contact_router.get("/", list_inbox_messages);
admin_contact_router.patch("/:id/read", update_message_status);
admin_contact_router.delete("/:id", delete_inbox_message);