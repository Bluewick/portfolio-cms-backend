import { ApiError } from "../utils/api_error.util.js";
import { send_error_response } from "../utils/response.util.js";
import { env_config } from "../config/env.config.js";

export const error_handler_middleware = (err, req, res, next) => {
  let status_code = err.status_code || 500;
  let error_code = err.error_code || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected internal server error occurred.";
  let details = err.details || [];

  // Handle malformed JSON request body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    status_code = 400;
    error_code = "INVALID_JSON_PAYLOAD";
    message = "Malformed JSON syntax in request body.";
  }

  // Handle native pg connection errors
  if (err.code === "ECONNREFUSED") {
    status_code = 503;
    error_code = "DATABASE_UNAVAILABLE";
    message = "Unable to connect to the database.";
  }

  if (env_config.node_env === "development" && status_code === 500) {
    console.error("[Unhandled Error Stack]:", err);
  }

  return send_error_response(res, status_code, error_code, message, details);
};