import { find_all_experiences, find_experience_by_id, insert_experience, update_experience_by_id, delete_experience_by_id } from "../models/experience.model.js";
import { reorder_collection_items } from "../models/reorder.model.js";
import { ApiError } from "../utils/api_error.util.js";

export const get_all_experiences = async () => {
  return await find_all_experiences();
};

export const add_experience = async (payload) => {
  if (!payload.company || !payload.role || !payload.start_date || !payload.description) {
    throw new ApiError(400, "Company, role, start_date, and description are required.", "VALIDATION_ERROR");
  }
  return await insert_experience(payload);
};

export const edit_experience = async (id, payload) => {
  const existing = await find_experience_by_id(id);
  if (!existing) {
    throw new ApiError(404, "Experience entry not found.", "RESOURCE_NOT_FOUND");
  }
  return await update_experience_by_id(id, payload);
};

export const remove_experience = async (id) => {
  const deleted = await delete_experience_by_id(id);
  if (!deleted) {
    throw new ApiError(404, "Experience entry not found.", "RESOURCE_NOT_FOUND");
  }
  return deleted;
};

export const reorder_experiences = async (items) => {
  await reorder_collection_items("experiences", items);
  return await find_all_experiences();
};