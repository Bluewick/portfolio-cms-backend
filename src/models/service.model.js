import { query } from "../config/db.js";

export const find_all_services = async () => {
  const sql = `SELECT * FROM services ORDER BY display_order ASC, created_at ASC;`;
  const result = await query(sql);
  return result.rows;
};

export const find_service_by_id = async (id) => {
  const sql = `SELECT * FROM services WHERE id = $1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

export const insert_service = async ({ title, description, icon_url, display_order }) => {
  let order = display_order;
  if (typeof order !== "number") {
    const max_order = await query(`SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM services;`);
    order = max_order.rows[0].next_order;
  }

  const sql = `
    INSERT INTO services (title, description, icon_url, display_order)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await query(sql, [title, description, icon_url, order]);
  return result.rows[0];
};

export const update_service_by_id = async (id, { title, description, icon_url, display_order }) => {
  const sql = `
    UPDATE services
    SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        icon_url = COALESCE($3, icon_url),
        display_order = COALESCE($4, display_order),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *;
  `;
  const result = await query(sql, [title, description, icon_url, display_order, id]);
  return result.rows[0] || null;
};

export const delete_service_by_id = async (id) => {
  const sql = `DELETE FROM services WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};