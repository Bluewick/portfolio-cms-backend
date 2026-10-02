import {
  insert_contact_message,
  find_paginated_messages,
  find_message_by_id,
  update_message_read_status,
  delete_message_by_id,
} from "../models/contact.model.js";
import { dispatch_contact_notification } from "./notification.service.js";
import { ApiError } from "../utils/api_error.util.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const process_contact_submission = async (payload, ip_address) => {
  const { name, email, subject, message } = payload;

  if (!name || !email || !subject || !message) {
    throw new ApiError(400, "Name, email, subject, and message are required fields.", "VALIDATION_ERROR");
  }

  const clean_email = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(clean_email)) {
    throw new ApiError(400, "Please provide a valid email address.", "INVALID_EMAIL");
  }

  const clean_name = name.trim();
  const clean_subject = subject.trim();
  const clean_message = message.trim();

  // Persist message to database
  const saved_message = await insert_contact_message({
    name: clean_name,
    email: clean_email,
    subject: clean_subject,
    message: clean_message,
    ip_address,
  });

  // Non-blocking background notification (execute asynchronously)
  setImmediate(() => {
    dispatch_contact_notification(saved_message).catch((err) => {
      console.error("[Background Notification Worker]:", err);
    });
  });

  return saved_message;
};

export const get_inbox_messages = async (query_params) => {
  const page = Math.max(1, parseInt(query_params.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query_params.limit, 10) || 10));
  const is_read = query_params.is_read === "true" ? true : query_params.is_read === "false" ? false : null;

  return await find_paginated_messages({ page, limit, is_read });
};

export const toggle_message_read = async (id, is_read) => {
  const existing = await find_message_by_id(id);
  if (!existing) {
    throw new ApiError(404, "Message not found in inbox.", "RESOURCE_NOT_FOUND");
  }

  const read_state = typeof is_read === "boolean" ? is_read : !existing.is_read;
  return await update_message_read_status(id, read_state);
};

export const remove_message = async (id) => {
  const deleted = await delete_message_by_id(id);
  if (!deleted) {
    throw new ApiError(404, "Message not found in inbox.", "RESOURCE_NOT_FOUND");
  }
  return deleted;
};