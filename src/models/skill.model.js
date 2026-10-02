import { query } from "../config/db.js";

export const find_all_skills = async () => {
  const sql = `SELECT * FROM skills ORDER BY display_order ASC, created_at ASC;`;
  const result = await query(sql);
  return result.rows;
};

export const find_skill_by_id = async (id) => {
  const sql = `SELECT * FROM skills WHERE id = $1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

export const insert_skill = async ({ name, category, icon_url, display_order }) => {
  let order = display_order;
  if (typeof order !== "number") {
    const max_order_res = await query(`SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM skills;`);
    order = max_order_res.rows[0].next_order;
  }

  const sql = `
    INSERT INTO skills (name, category, icon_url, display_order)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await query(sql, [name, category, icon_url, order]);
  return result.rows[0];
};

export const update_skill_by_id = async (id, { name, category, icon_url, display_order }) => {
  const sql = `
    UPDATE skills
    SET name = COALESCE($1, name),
        category = COALESCE($2, category),
        icon_url = COALESCE($3, icon_url),
        display_order = COALESCE($4, display_order),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *;
  `;
  const result = await query(sql, [name, category, icon_url, display_order, id]);
  return result.rows[0] || null;
};

export const delete_skill_by_id = async (id) => {
  const sql = `DELETE FROM skills WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};