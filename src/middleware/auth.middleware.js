import jwt from "jsonwebtoken";
import { env_config } from "../config/env.config.js";
import { send_error_response } from "../utils/response.util.js";

export const authenticate_user = (req, res, next) => {
  try {
    const auth_header = req.headers.authorization;

    if (!auth_header) {
      return send_error_response(res, 401, "UNAUTHORIZED_ACCESS", "Authorization header missing.");
    }

    if (!auth_header.startsWith("Bearer ")) {
      return send_error_response(res, 401, "INVALID_AUTH_FORMAT", "Invalid authorization format.");
    }

    const token = auth_header.split(" ")[1];

    if (!token) {
      return send_error_response(res, 401, "TOKEN_MISSING", "Token missing.");
    }

    const decoded = jwt.verify(token, env_config.jwt.secret);
    req.user = decoded;

    next();
  } catch (error) {
    return send_error_response(res, 401, "UNAUTHORIZED_ACCESS", "Invalid or expired token.");
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return send_error_response(res, 401, "UNAUTHORIZED_ACCESS", "Unauthorized.");
    }

    if (!roles.includes(req.user.role)) {
      return send_error_response(res, 403, "FORBIDDEN_ACCESS", "Forbidden.");
    }

    next();
  };
};

// CamelCase alias for full backward compatibility
export const authenticateUser = authenticate_user;