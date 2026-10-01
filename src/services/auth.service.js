import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { find_admin_by_email, find_admin_by_id } from "../models/auth.model.js";
import { ApiError } from "../utils/api_error.util.js";
import { env_config } from "../config/env.config.js";

/**
 * Authenticates admin and generates a signed JWT.
 */
export const login_admin = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.", "VALIDATION_ERROR");
  }

  const normalized_email = email.trim().toLowerCase();
  const admin = await find_admin_by_email(normalized_email);

  if (!admin) {
    throw new ApiError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  const is_password_valid = await bcrypt.compare(password, admin.password_hash);
  if (!is_password_valid) {
    throw new ApiError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  const token_payload = {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };

  const token = jwt.sign(token_payload, env_config.jwt.secret, {
    expiresIn: env_config.jwt.expires_in,
  });

  return {
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      created_at: admin.created_at,
    },
    token,
  };
};

/**
 * Retrieves the currently authenticated admin's profile.
 */
export const get_current_admin = async (admin_id) => {
  const admin = await find_admin_by_id(admin_id);

  if (!admin) {
    throw new ApiError(404, "Admin profile not found.", "ADMIN_NOT_FOUND");
  }

  return admin;
};