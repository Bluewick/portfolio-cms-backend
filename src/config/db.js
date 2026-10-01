import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const MODE = process.env.NODE_ENV || "development";
const { Pool } = pg;

const pool = MODE === "production"
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });


pool.on("connect", (client) => {
  console.log(`Connected to PostgreSQL Database: ${client.database}`);
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
  process.exit(-1);
});

// if (MODE === 'production') {
pool.on("connect", (client) => {
  client.query("SET search_path TO public");
  console.log(`Connected to PostgreSQL Database: ${client.database}`);
});
// }

pool.query("SELECT current_database(), current_schema()", (err, res) => {
  if (err) console.error(err);
  else console.log("Currently connected to:", res.rows[0]);
});

export const query = (text, params) => pool.query(text, params);
export default pool;