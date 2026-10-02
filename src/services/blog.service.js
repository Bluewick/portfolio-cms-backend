import {
  find_paginated_blogs,
  find_blog_by_slug,
  find_blog_by_id,
  insert_blog,
  update_blog_by_id,
  delete_blog_by_id,
} from "../models/blog.model.js";
import { create_slug, create_unique_slug } from "../utils/slugify.util.js";
import { ApiError } from "../utils/api_error.util.js";

const calculate_reading_time = (content) => {
  if (!content) return 1;
  const words_per_minute = 200;
  const word_count = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(word_count / words_per_minute));
};

export const get_public_blogs = async (query_params) => {
  const page = Math.max(1, parseInt(query_params.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(query_params.limit, 10) || 10));

  return await find_paginated_blogs({
    page,
    limit,
    is_admin: false,
  });
};

export const get_public_blog_details = async (slug) => {
  const blog = await find_blog_by_slug(slug, { is_admin: false });
  if (!blog) {
    throw new ApiError(404, "Blog post not found or is currently unpublished.", "RESOURCE_NOT_FOUND");
  }
  return blog;
};

export const get_admin_blogs = async (query_params) => {
  const page = Math.max(1, parseInt(query_params.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query_params.limit, 10) || 10));
  const status = query_params.status || null;

  return await find_paginated_blogs({
    page,
    limit,
    status,
    is_admin: true,
  });
};

export const get_admin_blog_details = async (id) => {
  const blog = await find_blog_by_id(id);
  if (!blog) {
    throw new ApiError(404, "Blog post not found.", "RESOURCE_NOT_FOUND");
  }
  return blog;
};

export const create_blog = async (payload) => {
  if (!payload.title || !payload.excerpt || !payload.content) {
    throw new ApiError(400, "Title, excerpt, and content are required.", "VALIDATION_ERROR");
  }

  let slug = payload.slug ? create_slug(payload.slug) : create_slug(payload.title);

  const existing = await find_blog_by_slug(slug, { is_admin: true });
  if (existing) {
    slug = create_unique_slug(payload.title);
  }

  const reading_time_minutes = calculate_reading_time(payload.content);

  return await insert_blog({
    title: payload.title,
    slug,
    excerpt: payload.excerpt,
    content: payload.content,
    cover_image_url: payload.cover_image_url || null,
    status: payload.status === "published" ? "published" : "draft",
    reading_time_minutes,
  });
};

export const update_blog = async (id, payload) => {
  const existing = await find_blog_by_id(id);
  if (!existing) {
    throw new ApiError(404, "Blog post not found.", "RESOURCE_NOT_FOUND");
  }

  let slug = undefined;
  if (payload.slug) {
    slug = create_slug(payload.slug);
    const existing_slug = await find_blog_by_slug(slug, { is_admin: true });
    if (existing_slug && existing_slug.id !== id) {
      slug = create_unique_slug(slug);
    }
  }

  let reading_time_minutes = undefined;
  if (payload.content) {
    reading_time_minutes = calculate_reading_time(payload.content);
  }

  return await update_blog_by_id(id, {
    title: payload.title,
    slug,
    excerpt: payload.excerpt,
    content: payload.content,
    cover_image_url: payload.cover_image_url,
    status: ["draft", "published"].includes(payload.status) ? payload.status : undefined,
    reading_time_minutes,
  });
};

export const delete_blog = async (id) => {
  const deleted = await delete_blog_by_id(id);
  if (!deleted) {
    throw new ApiError(404, "Blog post not found.", "RESOURCE_NOT_FOUND");
  }
  return deleted;
};