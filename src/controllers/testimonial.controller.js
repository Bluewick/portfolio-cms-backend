import { async_handler } from "../utils/async_handler.util.js";
import { send_success_response } from "../utils/response.util.js";
import { get_all_testimonials, add_testimonial, edit_testimonial, remove_testimonial, reorder_testimonials } from "../services/testimonial.service.js";

export const list_testimonials = async_handler(async (req, res) => {
  const testimonials = await get_all_testimonials();
  return send_success_response(res, 200, "Testimonials retrieved successfully.", testimonials);
});

export const create_testimonial = async_handler(async (req, res) => {
  const testimonial = await add_testimonial(req.body);
  return send_success_response(res, 201, "Testimonial created successfully.", testimonial);
});

export const update_testimonial = async_handler(async (req, res) => {
  const testimonial = await edit_testimonial(req.params.id, req.body);
  return send_success_response(res, 200, "Testimonial updated successfully.", testimonial);
});

export const delete_testimonial = async_handler(async (req, res) => {
  await remove_testimonial(req.params.id);
  return send_success_response(res, 200, "Testimonial deleted successfully.", { id: req.params.id });
});

export const batch_reorder_testimonials = async_handler(async (req, res) => {
  const updated = await reorder_testimonials(req.body.items);
  return send_success_response(res, 200, "Testimonials reordered successfully.", updated);
});