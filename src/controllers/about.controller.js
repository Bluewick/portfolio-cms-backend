import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import { fetch_about_profile, update_about_profile } from "../services/about.service.js";

export const get_about_data = async_handler(async (req, res) => {
  const profile = await fetch_about_profile();
  return send_success_response(res, 200, "About profile retrieved successfully.", profile);
});

export const update_about_data = async_handler(async (req, res) => {
  const updated = await update_about_profile(req.body);
  return send_success_response(res, 200, "About profile updated successfully.", updated);
});