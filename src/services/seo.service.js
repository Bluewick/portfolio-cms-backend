import fs from "fs";
import path from "path";
import { find_blog_by_slug } from "../models/blog.model.js";
import { find_project_by_slug } from "../models/project.model.js";
import { env_config } from "../config/env.config.js";

// Cached HTML template buffer
let cached_template = null;

const escape_html = (str = "") => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Retrieves the base index.html template from the build folder,
 * or returns a clean HTML shell if running standalone.
 */
const get_html_template = () => {
  if (cached_template && env_config.node_env === "production") {
    return cached_template;
  }

  // Attempt to load built Vite frontend index.html
  const dist_index_path = path.resolve(process.cwd(), "public/dist/index.html");

  if (fs.existsSync(dist_index_path)) {
    cached_template = fs.readFileSync(dist_index_path, "utf-8");
    return cached_template;
  }

  // Fallback HTML shell for development without a compiled frontend
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
};

/**
 * Injects OpenGraph and Twitter card metadata into the HTML head.
 */
const inject_meta_tags = (html_template, metadata) => {
  const { title, description, image_url, page_url, type = "website" } = metadata;

  const safe_title = escape_html(title);
  const safe_desc = escape_html(description);
  const safe_image = escape_html(image_url || `${env_config.client_url}/default-og.png`);
  const safe_url = escape_html(page_url);

  const tags = `
    <!-- Dynamic OpenGraph SEO Injection -->
    <title>${safe_title}</title>
    <meta name="description" content="${safe_desc}" />
    <meta property="og:title" content="${safe_title}" />
    <meta property="og:description" content="${safe_desc}" />
    <meta property="og:image" content="${safe_image}" />
    <meta property="og:url" content="${safe_url}" />
    <meta property="og:type" content="${type}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safe_title}" />
    <meta name="twitter:description" content="${safe_desc}" />
    <meta name="twitter:image" content="${safe_image}" />
  `;

  // Replace existing <title> tag if present, else prepend before </head>
  let hydrated = html_template.replace(/<title>[\s\S]*?<\/title>/i, "");
  hydrated = hydrated.replace("</head>", `${tags}\n  </head>`);

  return hydrated;
};

/**
 * Hydrates OpenGraph meta tags for a published blog post.
 */
export const get_hydrated_blog_seo = async (slug) => {
  const blog = await find_blog_by_slug(slug, { is_admin: false });
  const template = get_html_template();

  if (!blog) {
    return inject_meta_tags(template, {
      title: "Blog Post Not Found | Portfolio",
      description: "The requested blog post could not be found or has not yet been published.",
      page_url: `${env_config.client_url}/blogs/${slug}`,
    });
  }

  return inject_meta_tags(template, {
    title: `${blog.title} | Portfolio Blog`,
    description: blog.excerpt,
    image_url: blog.cover_image_url,
    page_url: `${env_config.client_url}/blogs/${blog.slug}`,
    type: "article",
  });
};

/**
 * Hydrates OpenGraph meta tags for a published project.
 */
export const get_hydrated_project_seo = async (slug) => {
  const project = await find_project_by_slug(slug, { is_admin: false });
  const template = get_html_template();

  if (!project) {
    return inject_meta_tags(template, {
      title: "Project Not Found | Portfolio",
      description: "The requested project could not be found or has not yet been published.",
      page_url: `${env_config.client_url}/projects/${slug}`,
    });
  }

  return inject_meta_tags(template, {
    title: `${project.title} | Portfolio Project`,
    description: project.summary,
    image_url: project.thumbnail_url,
    page_url: `${env_config.client_url}/projects/${project.slug}`,
    type: "website",
  });
};