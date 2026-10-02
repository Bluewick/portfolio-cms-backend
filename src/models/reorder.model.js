import pool from "../config/db.js";
import { ApiError } from "../utils/api_error.util.js";

const ALLOWED_TABLES = [
  "skills",
  "experiences",
  "services",
  "testimonials",
  "projects",
];

export const reorder_collection_items = async (table_name, items) => {
  if (!ALLOWED_TABLES.includes(table_name)) {
    throw new ApiError(400, `Table [${table_name}] is not eligible for manual reordering.`, "INVALID_TABLE_OPERATION");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Items payload must be a non-empty array of objects containing 'id' and 'display_order'.", "VALIDATION_ERROR");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const item of items) {
      if (!item.id || typeof item.display_order !== "number") {
        throw new ApiError(400, "Every item must contain a valid 'id' and integer 'display_order'.", "VALIDATION_ERROR");
      }

      await client.query(
        `UPDATE ${table_name} SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [item.display_order, item.id]
      );
    }

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};