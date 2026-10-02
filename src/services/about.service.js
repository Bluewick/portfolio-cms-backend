import { get_about, upsert_about } from "../models/about.model.js";
import { ApiError } from "../utils/api_error.util.js";

export const fetch_about_profile = async () => {
  const profile = await get_about();
  if (!profile) {
    return {
      name: "Your Name",
      title: "Full Stack Engineer",
      bio: "Welcome to my portfolio.",
      avatar_url: null,
      resume_url: null,
      social_links: {},
    };
  }
  return profile;
};

export const update_about_profile = async (payload) => {
  if (!payload.name || !payload.title || !payload.bio) {
    throw new ApiError(400, "Name, title, and bio are required fields.", "VALIDATION_ERROR");
  }
  return await upsert_about(payload);
};