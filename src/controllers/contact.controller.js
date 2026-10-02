import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import {
  process_contact_submission,
  get_inbox_messages,
  toggle_message_read,
  remove_message,
} from "../services/contact.service.js";

// Public Submission Endpoint
export const submit_contact_form = async_handler(async (req, res) => {
  const client_ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const result = await process_contact_submission(req.body, client_ip);

  return send_success_response(
    res,
    201,
    "Your message has been received. Thank you for reaching out!",
    { id: result.id, created_at: result.created_at }
  );
});

// Admin Inbox Endpoints
export const list_inbox_messages = async_handler(async (req, res) => {
  const { messages, total, page, limit, total_pages } = await get_inbox_messages(req.query);

  return send_success_response(
    res,
    200,
    "Inbox messages retrieved successfully.",
    messages,
    { page, limit, total, total_pages }
  );
});

export const update_message_status = async_handler(async (req, res) => {
  const { is_read } = req.body;
  const updated = await toggle_message_read(req.params.id, is_read);

  return send_success_response(res, 200, "Message status updated successfully.", updated);
});

export const delete_inbox_message = async_handler(async (req, res) => {
  await remove_message(req.params.id);

  return send_success_response(res, 200, "Message deleted successfully.", { id: req.params.id });
});