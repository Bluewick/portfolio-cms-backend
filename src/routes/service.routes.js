import express from "express";
import { list_services, create_service, update_service, delete_service, batch_reorder_services } from "../controllers/service.controller.js";
import { authenticate_user, authorize } from "../middleware/auth.middleware.js";

export const public_service_router = express.Router();
export const admin_service_router = express.Router();

// Public: GET /api/services
public_service_router.get("/", list_services);

// Admin: /api/admin/services
admin_service_router.use(authenticate_user, authorize("admin"));
admin_service_router.get("/", list_services);
admin_service_router.post("/", create_service);
admin_service_router.patch("/reorder", batch_reorder_services);
admin_service_router.put("/:id", update_service);
admin_service_router.delete("/:id", delete_service);