export class ApiError extends Error {
  constructor(status_code, message, error_code = "INTERNAL_SERVER_ERROR", details = []) {
    super(message);
    this.status_code = status_code;
    this.error_code = error_code;
    this.details = details;
    this.is_operational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}