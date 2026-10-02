import { find_all_services, find_service_by_id, insert_service, update_service_by_id, delete_service_by_id } from "../models/service.model.js";
import { reorder_collection_items } from "../models/reorder.model.js";
import { ApiError } from "../utils/api_error.util.js";

export const get_all_services = async () => {
  return await find_all_services();
};

export const add_service = async (payload) => {
  if (!payload.title || !payload.description) {
    throw new ApiError(400, "Title and description are required.", "VALIDATION_ERROR");
  }
  return await insert_service(payload);
};

export const edit_service = async (id, payload) => {
  const existing = await find_service_by_id(id);
  if (!existing) {
    throw new ApiError(404, "Service not found.", "RESOURCE_NOT_FOUND");
  }
  return await update_service_by_id(id, payload);
};

export const remove_service = async (id) => {
  const deleted = await delete_service_by_id(id);
  if (!deleted) {
    throw new ApiError(404, "Service not found.", "RESOURCE_NOT_FOUND");
  }
  return deleted;
};

export const reorder_services = async (items) => {
  await reorder_collection_items("services", items);
  return await find_all_services();
};