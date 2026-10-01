import dotenv from "dotenv";

dotenv.config();

export const env_config = {
  node_env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,
  client_url: process.env.CLIENT_URL || "http://localhost:5173",
  jwt: {
    secret: process.env.JWT_SECRET || "default_jwt_secret_change_in_production",
    expires_in: process.env.JWT_EXPIRES_IN || "7d",
  },
  db: {
    connection_string: process.env.DATABASE_URL,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "portfolio_db",
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || "",
    region: process.env.S3_REGION || "us-east-1",
    access_key_id: process.env.S3_ACCESS_KEY_ID || "",
    secret_access_key: process.env.S3_SECRET_ACCESS_KEY || "",
    bucket_name: process.env.S3_BUCKET_NAME || "",
  },
};