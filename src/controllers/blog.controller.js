import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import {
  get_public_blogs,
  get_public_blog_details,
  get_admin_blogs,
  get_admin_blog_details,
  create_blog,
  update_blog,
  delete_blog,
} from "../services/blog.service.js";

// Public Endpoints
export const list_public_blogs = async_handler(async (req, res) => {
  const { blogs, total, page, limit, total_pages } = await get_public_blogs(req.query);
  return send_success_response(res, 200, "Published blogs retrieved successfully.", blogs, {
    page,
    limit,
    total,
    total_pages,
  });
});

export const get_public_blog = async_handler(async (req, res) => {
  const blog = await get_public_blog_details(req.params.slug);
  return send_success_response(res, 200, "Blog details retrieved successfully.", blog);
});

// Admin CMS Endpoints
export const list_admin_blogs = async_handler(async (req, res) => {
  const { blogs, total, page, limit, total_pages } = await get_admin_blogs(req.query);
  return send_success_response(res, 200, "Admin blogs retrieved successfully.", blogs, {
    page,
    limit,
    total,
    total_pages,
  });
});

export const get_admin_blog = async_handler(async (req, res) => {
  const blog = await get_admin_blog_details(req.params.id);
  return send_success_response(res, 200, "Blog retrieved successfully.", blog);
});

export const create_blog_handler = async_handler(async (req, res) => {
  const blog = await create_blog(req.body);
  return send_success_response(res, 201, "Blog created successfully.", blog);
});

export const update_blog_handler = async_handler(async (req, res) => {
  const blog = await update_blog(req.params.id, req.body);
  return send_success_response(res, 200, "Blog updated successfully.", blog);
});

export const delete_blog_handler = async_handler(async (req, res) => {
  await delete_blog(req.params.id);
  return send_success_response(res, 200, "Blog deleted successfully.", { id: req.params.id });
});