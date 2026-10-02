import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import { get_all_skills, add_skill, edit_skill, remove_skill, reorder_skills } from "../services/skill.service.js";

export const list_skills = async_handler(async (req, res) => {
  const skills = await get_all_skills();
  return send_success_response(res, 200, "Skills retrieved successfully.", skills);
});

export const create_skill = async_handler(async (req, res) => {
  const skill = await add_skill(req.body);
  return send_success_response(res, 201, "Skill created successfully.", skill);
});

export const update_skill = async_handler(async (req, res) => {
  const skill = await edit_skill(req.params.id, req.body);
  return send_success_response(res, 200, "Skill updated successfully.", skill);
});

export const delete_skill = async_handler(async (req, res) => {
  await remove_skill(req.params.id);
  return send_success_response(res, 200, "Skill deleted successfully.", { id: req.params.id });
});

export const batch_reorder_skills = async_handler(async (req, res) => {
  const updated_list = await reorder_skills(req.body.items);
  return send_success_response(res, 200, "Skills reordered successfully.", updated_list);
});