import { async_handler } from "../utils/async_handler.util.js";
import { is_social_crawler } from "../utils/crawler.util.js";
import { get_hydrated_blog_seo, get_hydrated_project_seo } from "../services/seo.service.js";

/**
 * Intercepts /blogs/:slug route requests for SEO crawler hydration.
 */
export const handle_blog_seo = async_handler(async (req, res, next) => {
  const user_agent = req.headers["user-agent"] || "";

  // If request is from social bot, return hydrated HTML tags immediately
  if (is_social_crawler(user_agent)) {
    const html = await get_hydrated_blog_seo(req.params.slug);
    return res.status(200).set("Content-Type", "text/html").send(html);
  }

  // Otherwise, proceed to standard SPA client serving
  next();
});

/**
 * Intercepts /projects/:slug route requests for SEO crawler hydration.
 */
export const handle_project_seo = async_handler(async (req, res, next) => {
  const user_agent = req.headers["user-agent"] || "";

  // If request is from social bot, return hydrated HTML tags immediately
  if (is_social_crawler(user_agent)) {
    const html = await get_hydrated_project_seo(req.params.slug);
    return res.status(200).set("Content-Type", "text/html").send(html);
  }

  // Otherwise, proceed to standard SPA client serving
  next();
});