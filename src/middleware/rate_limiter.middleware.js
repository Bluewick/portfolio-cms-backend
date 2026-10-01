import rateLimit from "express-rate-limit";
import { send_error_response } from "../utils/response.util.js";

export const auth_rate_limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return send_error_response(
      res,
      429,
      "TOO_MANY_REQUESTS",
      "Too many login attempts from this IP. Please try again after 15 minutes."
    );
  },
});