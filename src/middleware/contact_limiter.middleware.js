import rateLimit from "express-rate-limit";
import { send_error_response } from "../utils/response.util.js";

export const contact_rate_limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 3, // Max 3 submissions per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return send_error_response(
      res,
      429,
      "TOO_MANY_REQUESTS",
      "Too many contact submissions from this IP. Please try again after 15 minutes."
    );
  },
});