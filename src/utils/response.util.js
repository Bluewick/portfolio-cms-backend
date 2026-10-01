/**
 * Format and send a standardized JSON success response.
 */
export const send_success_response = (res, status_code = 200, message = "Resource processed successfully", data = null, meta = null) => {
  const response_body = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };

  return res.status(status_code).json(response_body);
};

/**
 * Format and send a standardized JSON error response.
 */
export const send_error_response = (res, status_code = 500, error_code = "INTERNAL_SERVER_ERROR", message = "An unexpected error occurred.", details = []) => {
  const response_body = {
    success: false,
    error: {
      code: error_code,
      message,
      details,
    },
  };

  return res.status(status_code).json(response_body);
};