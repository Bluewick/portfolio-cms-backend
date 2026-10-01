import { query } from "../config/db.js";

/**
 * Find admin record by email address.
 */
export const find_admin_by_email = async (email) => {
  const sql = `
    SELECT id, email, password_hash, role, created_at, updated_at
    FROM admins
    WHERE email = $1
    LIMIT 1;
  `;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

/**
 * Find admin record by primary key ID.
 */
export const find_admin_by_id = async (id) => {
  const sql = `
    SELECT id, email, role, created_at, updated_at
    FROM admins
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};