import { find_all_testimonials, find_testimonial_by_id, insert_testimonial, update_testimonial_by_id, delete_testimonial_by_id } from "../models/testimonial.model.js";
import { reorder_collection_items } from "../models/reorder.model.js";
import { ApiError } from "../utils/api_error.util.js";

export const get_all_testimonials = async () => {
  return await find_all_testimonials();
};

export const add_testimonial = async (payload) => {
  if (!payload.client_name || !payload.quote) {
    throw new ApiError(400, "Client name and quote are required.", "VALIDATION_ERROR");
  }
  return await insert_testimonial(payload);
};

export const edit_testimonial = async (id, payload) => {
  const existing = await find_testimonial_by_id(id);
  if (!existing) {
    throw new ApiError(404, "Testimonial not found.", "RESOURCE_NOT_FOUND");
  }
  return await update_testimonial_by_id(id, payload);
};

export const remove_testimonial = async (id) => {
  const deleted = await delete_testimonial_by_id(id);
  if (!deleted) {
    throw new ApiError(404, "Testimonial not found.", "RESOURCE_NOT_FOUND");
  }
  return deleted;
};

export const reorder_testimonials = async (items) => {
  await reorder_collection_items("testimonials", items);
  return await find_all_testimonials();
};