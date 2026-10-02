import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import {
  get_public_projects,
  get_public_project_details,
  get_admin_projects,
  get_admin_project_details,
  create_project,
  update_project,
  delete_project,
  reorder_projects,
} from "../services/project.service.js";

// Public Endpoints
export const list_public_projects = async_handler(async (req, res) => {
  const projects = await get_public_projects(req.query);
  return send_success_response(res, 200, "Published projects retrieved successfully.", projects);
});

export const get_public_project = async_handler(async (req, res) => {
  const project = await get_public_project_details(req.params.slug);
  return send_success_response(res, 200, "Project details retrieved successfully.", project);
});

// Admin CMS Endpoints
export const list_admin_projects = async_handler(async (req, res) => {
  const projects = await get_admin_projects(req.query);
  return send_success_response(res, 200, "Admin projects retrieved successfully.", projects);
});

export const get_admin_project = async_handler(async (req, res) => {
  const project = await get_admin_project_details(req.params.id);
  return send_success_response(res, 200, "Project retrieved successfully.", project);
});

export const create_project_handler = async_handler(async (req, res) => {
  const project = await create_project(req.body);
  return send_success_response(res, 201, "Project created successfully.", project);
});

export const update_project_handler = async_handler(async (req, res) => {
  const project = await update_project(req.params.id, req.body);
  return send_success_response(res, 200, "Project updated successfully.", project);
});

export const delete_project_handler = async_handler(async (req, res) => {
  await delete_project(req.params.id);
  return send_success_response(res, 200, "Project deleted successfully.", { id: req.params.id });
});

export const reorder_projects_handler = async_handler(async (req, res) => {
  const updated_list = await reorder_projects(req.body.items);
  return send_success_response(res, 200, "Projects reordered successfully.", updated_list);
});