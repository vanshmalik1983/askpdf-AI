import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// Performance middleware
app.use(compression());

// Body parsers
app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Request logging
app.use(
  morgan(
    env.nodeEnv === "development"
      ? "dev"
      : "combined"
  )
);

// Global API rate limiting
app.use(apiLimiter);

// API routes
app.use("/api/v1", routes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;