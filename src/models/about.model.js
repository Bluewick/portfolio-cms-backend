import { query } from "../config/db.js";

export const get_about = async () => {
  const sql = `SELECT * FROM about LIMIT 1;`;
  const result = await query(sql);
  return result.rows[0] || null;
};

export const upsert_about = async ({ name, title, bio, avatar_url, resume_url, social_links }) => {
  const existing = await get_about();

  if (existing) {
    const update_sql = `
      UPDATE about
      SET name = $1,
          title = $2,
          bio = $3,
          avatar_url = $4,
          resume_url = $5,
          social_links = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const result = await query(update_sql, [
      name,
      title,
      bio,
      avatar_url,
      resume_url,
      JSON.stringify(social_links || {}),
      existing.id,
    ]);
    return result.rows[0];
  }

  const insert_sql = `
    INSERT INTO about (name, title, bio, avatar_url, resume_url, social_links)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const result = await query(insert_sql, [
    name,
    title,
    bio,
    avatar_url,
    resume_url,
    JSON.stringify(social_links || {}),
  ]);
  return result.rows[0];
};