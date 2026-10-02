import { find_all_skills, find_skill_by_id, insert_skill, update_skill_by_id, delete_skill_by_id } from "../models/skill.model.js";
import { reorder_collection_items } from "../models/reorder.model.js";
import { ApiError } from "../utils/api_error.util.js";

export const get_all_skills = async () => {
  return await find_all_skills();
};

export const add_skill = async (payload) => {
  if (!payload.name || !payload.category) {
    throw new ApiError(400, "Skill name and category are required.", "VALIDATION_ERROR");
  }
  return await insert_skill(payload);
};

export const edit_skill = async (id, payload) => {
  const existing = await find_skill_by_id(id);
  if (!existing) {
    throw new ApiError(404, "Skill not found.", "RESOURCE_NOT_FOUND");
  }
  return await update_skill_by_id(id, payload);
};

export const remove_skill = async (id) => {
  const deleted = await delete_skill_by_id(id);
  if (!deleted) {
    throw new ApiError(404, "Skill not found.", "RESOURCE_NOT_FOUND");
  }
  return deleted;
};

export const reorder_skills = async (items) => {
  await reorder_collection_items("skills", items);
  return await find_all_skills();
};