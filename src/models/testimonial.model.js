import { query } from "../config/db.js";

export const find_all_testimonials = async () => {
  const sql = `SELECT * FROM testimonials ORDER BY display_order ASC, created_at ASC;`;
  const result = await query(sql);
  return result.rows;
};

export const find_testimonial_by_id = async (id) => {
  const sql = `SELECT * FROM testimonials WHERE id = $1;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

export const insert_testimonial = async ({ client_name, client_title, company, avatar_url, quote, display_order }) => {
  let order = display_order;
  if (typeof order !== "number") {
    const max_order = await query(`SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM testimonials;`);
    order = max_order.rows[0].next_order;
  }

  const sql = `
    INSERT INTO testimonials (client_name, client_title, company, avatar_url, quote, display_order)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const result = await query(sql, [client_name, client_title, company, avatar_url, quote, order]);
  return result.rows[0];
};

export const update_testimonial_by_id = async (id, { client_name, client_title, company, avatar_url, quote, display_order }) => {
  const sql = `
    UPDATE testimonials
    SET client_name = COALESCE($1, client_name),
        client_title = COALESCE($2, client_title),
        company = COALESCE($3, company),
        avatar_url = COALESCE($4, avatar_url),
        quote = COALESCE($5, quote),
        display_order = COALESCE($6, display_order),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *;
  `;
  const result = await query(sql, [client_name, client_title, company, avatar_url, quote, display_order, id]);
  return result.rows[0] || null;
};

export const delete_testimonial_by_id = async (id) => {
  const sql = `DELETE FROM testimonials WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};