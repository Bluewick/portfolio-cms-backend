import { query } from "../config/db.js";

/**
 * Persist incoming contact message.
 */
export const insert_contact_message = async ({ name, email, subject, message, ip_address }) => {
  const sql = `
    INSERT INTO contact_messages (name, email, subject, message, ip_address, is_read)
    VALUES ($1, $2, $3, $4, $5, false)
    RETURNING id, name, email, subject, message, is_read, created_at;
  `;
  const params = [name, email, subject, message, ip_address || null];
  const result = await query(sql, params);
  return result.rows[0];
};

/**
 * Paginated inbox retrieval for Admin dashboard.
 */
export const find_paginated_messages = async ({ page = 1, limit = 10, is_read = null }) => {
  const conditions = [];
  const params = [];
  let param_index = 1;

  if (typeof is_read === "boolean") {
    conditions.push(`is_read = $${param_index++}`);
    params.push(is_read);
  }

  const where_clause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // 1. Total count
  const count_sql = `SELECT COUNT(*) AS total FROM contact_messages ${where_clause};`;
  const count_res = await query(count_sql, params);
  const total = parseInt(count_res.rows[0].total, 10);

  // 2. Fetch paginated slice
  const offset = (page - 1) * limit;
  const select_params = [...params, limit, offset];
  const select_sql = `
    SELECT id, name, email, subject, message, is_read, ip_address, created_at, updated_at
    FROM contact_messages
    ${where_clause}
    ORDER BY created_at DESC
    LIMIT $${param_index++} OFFSET $${param_index++};
  `;

  const result = await query(select_sql, select_params);

  return {
    messages: result.rows,
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total_pages: Math.ceil(total / limit) || 1,
  };
};

/**
 * Find single message by ID.
 */
export const find_message_by_id = async (id) => {
  const sql = `SELECT * FROM contact_messages WHERE id = $1 LIMIT 1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/**
 * Toggle message read status.
 */
export const update_message_read_status = async (id, is_read) => {
  const sql = `
    UPDATE contact_messages
    SET is_read = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, name, email, subject, message, is_read, updated_at;
  `;
  const result = await query(sql, [is_read, id]);
  return result.rows[0] || null;
};

/**
 * Delete message from inbox.
 */
export const delete_message_by_id = async (id) => {
  const sql = `DELETE FROM contact_messages WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};