import { S3Client } from "@aws-sdk/client-s3";
import { env_config } from "./env.config.js";

const s3_configuration = {
  region: env_config.s3.region || "us-east-1",
  credentials: {
    accessKeyId: env_config.s3.access_key_id,
    secretAccessKey: env_config.s3.secret_access_key,
  },
};

// Custom S3-compatible endpoint configuration (Neon S3, Cloudflare R2, MinIO, etc.)
if (env_config.s3.endpoint) {
  s3_configuration.endpoint = env_config.s3.endpoint;
  s3_configuration.forcePathStyle = true; // Required for custom non-AWS endpoints
}

export const s3_client = new S3Client(s3_configuration);