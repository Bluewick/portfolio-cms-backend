import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import { login_admin, get_current_admin } from "../services/auth.service.js";

/**
 * Authenticate admin with email and password.
 */
export const login = async_handler(async (req, res) => {
  const { email, password } = req.body;
  const result = await login_admin({ email, password });

  return send_success_response(res, 200, "Authentication successful.", result);
});

/**
 * Retrieve the authenticated admin profile.
 */
export const get_me = async_handler(async (req, res) => {
  const admin = await get_current_admin(req.user.id);

  return send_success_response(res, 200, "Admin profile retrieved successfully.", { admin });
});