import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import { get_all_experiences, add_experience, edit_experience, remove_experience, reorder_experiences } from "../services/experience.service.js";

export const list_experiences = async_handler(async (req, res) => {
  const experiences = await get_all_experiences();
  return send_success_response(res, 200, "Experiences retrieved successfully.", experiences);
});

export const create_experience = async_handler(async (req, res) => {
  const experience = await add_experience(req.body);
  return send_success_response(res, 201, "Experience entry created successfully.", experience);
});

export const update_experience = async_handler(async (req, res) => {
  const experience = await edit_experience(req.params.id, req.body);
  return send_success_response(res, 200, "Experience entry updated successfully.", experience);
});

export const delete_experience = async_handler(async (req, res) => {
  await remove_experience(req.params.id);
  return send_success_response(res, 200, "Experience entry deleted successfully.", { id: req.params.id });
});

export const batch_reorder_experiences = async_handler(async (req, res) => {
  const updated = await reorder_experiences(req.body.items);
  return send_success_response(res, 200, "Experiences reordered successfully.", updated);
});