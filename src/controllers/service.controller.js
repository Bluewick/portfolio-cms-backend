import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import { get_all_services, add_service, edit_service, remove_service, reorder_services } from "../services/service.service.js";

export const list_services = async_handler(async (req, res) => {
  const services = await get_all_services();
  return send_success_response(res, 200, "Services retrieved successfully.", services);
});

export const create_service = async_handler(async (req, res) => {
  const service = await add_service(req.body);
  return send_success_response(res, 201, "Service created successfully.", service);
});

export const update_service = async_handler(async (req, res) => {
  const service = await edit_service(req.params.id, req.body);
  return send_success_response(res, 200, "Service updated successfully.", service);
});

export const delete_service = async_handler(async (req, res) => {
  await remove_service(req.params.id);
  return send_success_response(res, 200, "Service deleted successfully.", { id: req.params.id });
});

export const batch_reorder_services = async_handler(async (req, res) => {
  const updated = await reorder_services(req.body.items);
  return send_success_response(res, 200, "Services reordered successfully.", updated);
});