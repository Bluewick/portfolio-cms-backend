import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import { generate_presigned_upload_url } from "../services/media.service.js";

/**
 * Controller to request a presigned upload URL for media assets.
 */
export const get_presigned_url = async_handler(async (req, res) => {
  const { file_name, content_type } = req.body;

  const result = await generate_presigned_upload_url({
    file_name,
    content_type,
  });

  return send_success_response(
    res,
    200,
    "Presigned upload URL generated successfully.",
    result
  );
});