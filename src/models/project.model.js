import pool, { query } from "../config/db.js";

/**
 * Common SQL fragment to aggregate related skills and dynamic links for projects.
 */
const PROJECT_SELECT_FIELDS = `
  p.id,
  p.title,
  p.slug,
  p.summary,
  p.content,
  p.thumbnail_url,
  p.live_url,
  p.github_url,
  p.links,
  p.is_featured,
  p.status,
  p.display_order,
  p.created_at,
  p.updated_at,
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', s.id,
        'name', s.name,
        'category', s.category,
        'icon_url', s.icon_url
      ) ORDER BY s.display_order ASC
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::json
  ) AS skills
`;

/**
 * List projects with optional filtering (status, is_featured).
 */
export const find_projects = async ({ status = null, is_featured = null, is_admin = false }) => {
  const conditions = [];
  const params = [];
  let param_index = 1;

  if (!is_admin) {
    conditions.push(`p.status = 'published'`);
  } else if (status) {
    conditions.push(`p.status = $${param_index++}`);
    params.push(status);
  }

  if (typeof is_featured === "boolean") {
    conditions.push(`p.is_featured = $${param_index++}`);
    params.push(is_featured);
  }

  const where_clause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT ${PROJECT_SELECT_FIELDS}
    FROM projects p
    LEFT JOIN project_skills ps ON ps.project_id = p.id
    LEFT JOIN skills s ON s.id = ps.skill_id
    ${where_clause}
    GROUP BY p.id
    ORDER BY p.display_order ASC, p.created_at DESC;
  `;

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Find single project by slug.
 */
export const find_project_by_slug = async (slug, { is_admin = false }) => {
  const conditions = [`p.slug = $1`];
  if (!is_admin) {
    conditions.push(`p.status = 'published'`);
  }

  const sql = `
    SELECT ${PROJECT_SELECT_FIELDS}
    FROM projects p
    LEFT JOIN project_skills ps ON ps.project_id = p.id
    LEFT JOIN skills s ON s.id = ps.skill_id
    WHERE ${conditions.join(" AND ")}
    GROUP BY p.id
    LIMIT 1;
  `;

  const result = await query(sql, [slug]);
  return result.rows[0] || null;
};

/**
 * Find single project by ID (CMS administrative checks).
 */
export const find_project_by_id = async (id) => {
  const sql = `
    SELECT ${PROJECT_SELECT_FIELDS}
    FROM projects p
    LEFT JOIN project_skills ps ON ps.project_id = p.id
    LEFT JOIN skills s ON s.id = ps.skill_id
    WHERE p.id = $1
    GROUP BY p.id
    LIMIT 1;
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/**
 * Atomic Transaction: Create project and link skill relations with dynamic links support.
 */
export const insert_project_transactional = async (project_data, skill_ids = []) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Determine next display order if omitted
    let display_order = project_data.display_order;
    if (typeof display_order !== "number") {
      const order_res = await client.query("SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM projects;");
      display_order = order_res.rows[0].next_order;
    }

    // 2. Insert Project
    const project_insert_sql = `
      INSERT INTO projects (
        title, slug, summary, content, thumbnail_url, live_url, github_url, links, is_featured, status, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const project_params = [
      project_data.title,
      project_data.slug,
      project_data.summary,
      project_data.content,
      project_data.thumbnail_url || null,
      project_data.live_url || null,
      project_data.github_url || null,
      JSON.stringify(project_data.links || []),
      project_data.is_featured || false,
      project_data.status || "draft",
      display_order,
    ];

    const project_res = await client.query(project_insert_sql, project_params);
    const created_project = project_res.rows[0];

    // 3. Insert Skill Associations
    if (Array.isArray(skill_ids) && skill_ids.length > 0) {
      for (const skill_id of skill_ids) {
        await client.query(
          `INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
          [created_project.id, skill_id]
        );
      }
    }

    await client.query("COMMIT");
    return created_project;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Atomic Transaction: Update project metadata and synchronize skill associations and dynamic links.
 */
export const update_project_transactional = async (id, project_data, skill_ids) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Update Project Row
    const project_update_sql = `
      UPDATE projects
      SET title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          summary = COALESCE($3, summary),
          content = COALESCE($4, content),
          thumbnail_url = COALESCE($5, thumbnail_url),
          live_url = COALESCE($6, live_url),
          github_url = COALESCE($7, github_url),
          links = COALESCE($8, links),
          is_featured = COALESCE($9, is_featured),
          status = COALESCE($10, status),
          display_order = COALESCE($11, display_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *;
    `;

    const project_params = [
      project_data.title,
      project_data.slug,
      project_data.summary,
      project_data.content,
      project_data.thumbnail_url,
      project_data.live_url,
      project_data.github_url,
      project_data.links !== undefined ? JSON.stringify(project_data.links) : null,
      project_data.is_featured,
      project_data.status,
      project_data.display_order,
      id,
    ];

    const project_res = await client.query(project_update_sql, project_params);
    const updated_project = project_res.rows[0];

    // 2. Synchronize Skill Links if skill_ids was explicitly passed
    if (Array.isArray(skill_ids)) {
      await client.query(`DELETE FROM project_skills WHERE project_id = $1;`, [id]);

      for (const skill_id of skill_ids) {
        await client.query(
          `INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
          [id, skill_id]
        );
      }
    }

    await client.query("COMMIT");
    return updated_project;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete Project (Cascades automatically to project_skills via FK).
 */
export const delete_project_by_id = async (id) => {
  const sql = `DELETE FROM projects WHERE id = $1 RETURNING id;`;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};