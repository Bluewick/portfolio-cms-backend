import {
  find_projects,
  find_project_by_slug,
  find_project_by_id,
  insert_project_transactional,
  update_project_transactional,
  delete_project_by_id,
} from "../models/project.model.js";
import { reorder_collection_items } from "../models/reorder.model.js";
import { create_slug, create_unique_slug } from "../utils/slugify.util.js";
import { ApiError } from "../utils/api_error.util.js";

/**
 * Validates dynamic link objects structure.
 */
const sanitize_project_links = (links) => {
  if (!links) return [];
  if (!Array.isArray(links)) {
    throw new ApiError(400, "'links' must be an array of link objects.", "VALIDATION_ERROR");
  }

  return links.map((link, index) => {
    if (!link.label || !link.url) {
      throw new ApiError(
        400,
        `Link item at index [${index}] must include both 'label' and 'url'.`,
        "VALIDATION_ERROR"
      );
    }

    return {
      label: String(link.label).trim(),
      url: String(link.url).trim(),
      icon_url: link.icon_url ? String(link.icon_url).trim() : null,
    };
  });
};

export const get_public_projects = async (query_params) => {
  const is_featured = query_params.featured === "true" ? true : query_params.featured === "false" ? false : null;
  return await find_projects({ is_featured, is_admin: false });
};

export const get_public_project_details = async (slug) => {
  const project = await find_project_by_slug(slug, { is_admin: false });
  if (!project) {
    throw new ApiError(404, "Project not found or is currently unpublished.", "RESOURCE_NOT_FOUND");
  }
  return project;
};

export const get_admin_projects = async (query_params) => {
  const status = query_params.status || null;
  const is_featured = query_params.featured === "true" ? true : query_params.featured === "false" ? false : null;
  return await find_projects({ status, is_featured, is_admin: true });
};

export const get_admin_project_details = async (id) => {
  const project = await find_project_by_id(id);
  if (!project) {
    throw new ApiError(404, "Project not found.", "RESOURCE_NOT_FOUND");
  }
  return project;
};

export const create_project = async (payload) => {
  if (!payload.title || !payload.summary || !payload.content) {
    throw new ApiError(400, "Title, summary, and content are required.", "VALIDATION_ERROR");
  }

  let slug = payload.slug ? create_slug(payload.slug) : create_slug(payload.title);

  // Guard against duplicate slug
  const existing_by_slug = await find_project_by_slug(slug, { is_admin: true });
  if (existing_by_slug) {
    slug = create_unique_slug(payload.title);
  }

  const sanitized_links = sanitize_project_links(payload.links);

  const project_data = {
    title: payload.title,
    slug,
    summary: payload.summary,
    content: payload.content,
    thumbnail_url: payload.thumbnail_url || null,
    live_url: payload.live_url || null,
    github_url: payload.github_url || null,
    links: sanitized_links,
    is_featured: Boolean(payload.is_featured),
    status: payload.status === "published" ? "published" : "draft",
    display_order: payload.display_order,
  };

  const created = await insert_project_transactional(project_data, payload.skill_ids || []);
  return await find_project_by_id(created.id);
};

export const update_project = async (id, payload) => {
  const existing = await find_project_by_id(id);
  if (!existing) {
    throw new ApiError(404, "Project not found.", "RESOURCE_NOT_FOUND");
  }

  let slug = undefined;
  if (payload.slug) {
    slug = create_slug(payload.slug);
    const existing_slug = await find_project_by_slug(slug, { is_admin: true });
    if (existing_slug && existing_slug.id !== id) {
      slug = create_unique_slug(slug);
    }
  }

  const sanitized_links = payload.links !== undefined ? sanitize_project_links(payload.links) : undefined;

  const project_data = {
    title: payload.title,
    slug,
    summary: payload.summary,
    content: payload.content,
    thumbnail_url: payload.thumbnail_url,
    live_url: payload.live_url,
    github_url: payload.github_url,
    links: sanitized_links,
    is_featured: typeof payload.is_featured === "boolean" ? payload.is_featured : undefined,
    status: ["draft", "published"].includes(payload.status) ? payload.status : undefined,
    display_order: payload.display_order,
  };

  await update_project_transactional(id, project_data, payload.skill_ids);
  return await find_project_by_id(id);
};

export const delete_project = async (id) => {
  const deleted = await delete_project_by_id(id);
  if (!deleted) {
    throw new ApiError(404, "Project not found.", "RESOURCE_NOT_FOUND");
  }
  return deleted;
};

export const reorder_projects = async (items) => {
  await reorder_collection_items("projects", items);
  return await find_projects({ is_admin: true });
};