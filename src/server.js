import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import auth_routes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import helmet from "helmet";
import { error_handler_middleware } from "./middleware/error.middleware.js";

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