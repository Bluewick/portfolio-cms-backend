import pg from "pg";
import { env_config } from "./env.config.js";

const { Pool } = pg;
const MODE = env_config.node_env;

const pool = MODE === "production"
  ? new Pool({
      connectionString: env_config.db.connection_string,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: env_config.db.host,
      port: env_config.db.port,
      user: env_config.db.user,
      password: env_config.db.password,
      database: env_config.db.name,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

pool.on("connect", (client) => {
  client.query("SET search_path TO public");
  console.log(`[PostgreSQL] Client connected to database: ${client.database}`);
});

pool.on("error", (err) => {
  console.error("[PostgreSQL] Unexpected error on idle client:", err);
  process.exit(-1);
});

pool.query("SELECT current_database(), current_schema()", (err, res) => {
  if (err) {
    console.error("[PostgreSQL] Initial connection error:", err.message);
  } else {
    console.log("[PostgreSQL] Successfully verified connection:", res.rows[0]);
  }
});

export const query = (text, params) => pool.query(text, params);
export default pool;