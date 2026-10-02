import { query } from "../config/db.js";

/**
 * Paginated blog query supporting draft filtering.
 */
export const find_paginated_blogs = async ({ page = 1, limit = 10, status = null, is_admin = false }) => {
  const conditions = [];
  const params = [];
  let param_index = 1;

  if (!is_admin) {
    conditions.push(`status = 'published'`);
  } else if (status) {
    conditions.push(`status = $${param_index++}`);
    params.push(status);
  }

  const where_clause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // 1. Total records count
  const count_sql = `SELECT COUNT(*) AS total FROM blogs ${where_clause};`;
  const count_res = await query(count_sql, params);
  const total = parseInt(count_res.rows[0].total, 10);

  // 2. Fetch records
  const offset = (page - 1) * limit;
  const select_params = [...params, limit, offset];
  const select_sql = `
    SELECT id, title, slug, excerpt, content, cover_image_url, status, reading_time_minutes, created_at, updated_at
    FROM blogs
    ${where_clause}
    ORDER BY created_at DESC
    LIMIT $${param_index++} OFFSET $${param_index++};
  `;

  const data_res = await query(select_sql, select_params);

  return {
    blogs: data_res.rows,
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total_pages: Math.ceil(total / limit) || 1,
  };
};

/**
 * Find single blog by slug.
 */
export const find_blog_by_slug = async (slug, { is_admin = false }) => {
  const conditions = [`slug = $1`];
  if (!is_admin) {
    conditions.push(`status = 'published'`);
  }

  const sql = `
    SELECT *
    FROM blogs
    WHERE ${conditions.join(" AND ")}
    LIMIT 1;
  `;

  const result = await query(sql, [slug]);
  return result.rows[0] || null;
};

/**
 * Find single blog by ID.
 */
export const find_blog_by_id = async (id) => {
  const sql = `SELECT * FROM blogs WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/**
 * Insert new blog post.
 */
export const insert_blog = async ({ title, slug, excerpt, content, cover_image_url, status, reading_time_minutes }) => {
  const sql = `
    INSERT INTO blogs (title, slug, excerpt, content, cover_image_url, status, reading_time_minutes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const params = [
    title,
    slug,
    excerpt,
    content,
    cover_image_url || null,
    status || "draft",
    reading_time_minutes || 1,
  ];

  const result = await query(sql, params);
  return result.rows[0];
};

/**
 * Update existing blog post.
 */
export const update_blog_by_id = async (id, { title, slug, excerpt, content, cover_image_url, status, reading_time_minutes }) => {
  const sql = `
    UPDATE blogs
    SET title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        excerpt = COALESCE($3, excerpt),
        content = COALESCE($4, content),
        cover_image_url = COALESCE($5, cover_image_url),
        status = COALESCE($6, status),
        reading_time_minutes = COALESCE($7, reading_time_minutes),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *;
  `;

  const params = [title, slug, excerpt, content, cover_image_url, status, reading_time_minutes, id];
  const result = await query(sql, params);
  return result.rows[0] || null;
};

/**
 * Delete blog post.
 */
export const delete_blog_by_id = async (id) => {
  const sql = `DELETE FROM blogs WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};