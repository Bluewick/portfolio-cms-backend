import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import dotenv from "dotenv";
import helmet from "helmet";
import { error_handler_middleware } from "./middleware/error.middleware.js";

import auth_routes from "./routes/auth.routes.js";
import media_routes from "./routes/media.routes.js";
import { public_about_router, admin_about_router } from "./routes/about.routes.js";
import { public_skill_router, admin_skill_router } from "./routes/skill.routes.js";
import { public_experience_router, admin_experience_router } from "./routes/experience.routes.js";
import { public_service_router, admin_service_router } from "./routes/service.routes.js";
import { public_testimonial_router, admin_testimonial_router } from "./routes/testimonial.routes.js";
import { public_project_router, admin_project_router } from "./routes/project.routes.js";
import { public_blog_router, admin_blog_router } from "./routes/blog.routes.js";
import { public_contact_router, admin_contact_router } from "./routes/contact.routes.js";
import seo_routes from "./routes/seo.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const CLIENT = process.env.FRONTEND_URL;

const allowedOrigins = [
  CLIENT,
  'http://localhost:5253',
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

const allowedRegexPatterns = [
  /^https:\/\/.*\.vercel\.app$/
];

const corsOptions = {
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      allowedRegexPatterns.some((pattern) => pattern.test(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-link-password'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());


app.use("/api/admin/auth", auth_routes);
app.use("/api/admin/media", media_routes);

app.use("/api/admin/about", admin_about_router);
app.use("/api/admin/skills", admin_skill_router);
app.use("/api/admin/experiences", admin_experience_router);
app.use("/api/admin/services", admin_service_router);
app.use("/api/admin/testimonials", admin_testimonial_router);
app.use("/api/admin/projects", admin_project_router);
app.use("/api/admin/blogs", admin_blog_router);
app.use("/api/admin/contact", admin_contact_router);

// Public Portfolio Routes
app.use("/api/about", public_about_router);
app.use("/api/skills", public_skill_router);
app.use("/api/experiences", public_experience_router);
app.use("/api/services", public_service_router);
app.use("/api/testimonials", public_testimonial_router);
app.use("/api/projects", public_project_router);
app.use("/api/blogs", public_blog_router);
app.use("/api/contact", public_contact_router);

// SEO Hydration Routes (Prefix with API so they still hit this server)
app.use("/", seo_routes);

app.get("/", (req, res) => {
  res.send("Backend Server is running 🚀");
});

// Centralized Global Error Handler Middleware
app.use(error_handler_middleware);

const PORT = process.env.PORT || 5213;

try {
  const result = await pool.query("SELECT NOW()");
  console.log("✅ PostgreSQL Connected");
  console.log(result.rows[0]);
} catch (err) {
  console.error("❌ Database Connection Failed");
  console.error(err.message);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});