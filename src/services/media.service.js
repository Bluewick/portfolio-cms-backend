import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import { s3_client } from "../config/s3.config.js";
import { env_config } from "../config/env.config.js";
import { ApiError } from "../utils/api_error.util.js";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MIME_EXTENSION_MAP = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/**
 * Generates an authorized presigned PUT upload URL and permanent public read URL.
 */
export const generate_presigned_upload_url = async ({ file_name, content_type }) => {
  if (!file_name || !content_type) {
    throw new ApiError(400, "Both file_name and content_type are required.", "VALIDATION_ERROR");
  }

  const normalized_mime = content_type.toLowerCase().trim();

  // 1. Validate MIME against security whitelist
  if (!ALLOWED_MIME_TYPES.includes(normalized_mime)) {
    throw new ApiError(
      400,
      `Unsupported media format [${normalized_mime}]. Allowed formats: JPG, PNG, WEBP, GIF, SVG.`,
      "INVALID_MIME_TYPE"
    );
  }

  // 2. Derive trusted file extension
  const file_extension = MIME_EXTENSION_MAP[normalized_mime] || path.extname(file_name).slice(1) || "bin";

  // 3. Generate collision-safe partitioned storage key
  const current_year = new Date().getFullYear();
  const unique_identifier = crypto.randomUUID();
  const file_key = `uploads/${current_year}/${unique_identifier}.${file_extension}`;

  // 4. Construct S3 PutObject Command
  const put_command = new PutObjectCommand({
    Bucket: env_config.s3.bucket_name,
    Key: file_key,
    ContentType: normalized_mime,
  });

  // 5. Generate signed URL (expires in 15 minutes = 900 seconds)
  const expiration_seconds = 900;
  const upload_url = await getSignedUrl(s3_client, put_command, {
    expiresIn: expiration_seconds,
  });

  // 6. Build permanent public asset URL
  let public_url = "";
  if (env_config.s3.endpoint) {
    const clean_endpoint = env_config.s3.endpoint.replace(/\/+$/, "");
    public_url = `${clean_endpoint}/${env_config.s3.bucket_name}/${file_key}`;
  } else {
    public_url = `https://${env_config.s3.bucket_name}.s3.${env_config.s3.region}.amazonaws.com/${file_key}`;
  }

  return {
    upload_url,
    public_url,
    file_key,
    content_type: normalized_mime,
    expires_in_seconds: expiration_seconds,
  };
};