import { query } from "../config/db.js";

export const find_all_experiences = async () => {
  const sql = `SELECT * FROM experiences ORDER BY display_order ASC, start_date DESC;`;
  const result = await query(sql);
  return result.rows;
};

export const find_experience_by_id = async (id) => {
  const sql = `SELECT * FROM experiences WHERE id = $1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

export const insert_experience = async ({ company, role, location, start_date, end_date, is_current, description, display_order }) => {
  let order = display_order;
  if (typeof order !== "number") {
    const max_order = await query(`SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM experiences;`);
    order = max_order.rows[0].next_order;
  }

  const sql = `
    INSERT INTO experiences (company, role, location, start_date, end_date, is_current, description, display_order)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const result = await query(sql, [company, role, location, start_date, end_date || null, is_current || false, description, order]);
  return result.rows[0];
};

export const update_experience_by_id = async (id, { company, role, location, start_date, end_date, is_current, description, display_order }) => {
  const sql = `
    UPDATE experiences
    SET company = COALESCE($1, company),
        role = COALESCE($2, role),
        location = COALESCE($3, location),
        start_date = COALESCE($4, start_date),
        end_date = $5,
        is_current = COALESCE($6, is_current),
        description = COALESCE($7, description),
        display_order = COALESCE($8, display_order),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *;
  `;
  const result = await query(sql, [company, role, location, start_date, end_date, is_current, description, display_order, id]);
  return result.rows[0] || null;
};

export const delete_experience_by_id = async (id) => {
  const sql = `DELETE FROM experiences WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};