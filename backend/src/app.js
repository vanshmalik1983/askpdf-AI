import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" })); // small limit: file uploads go through multer, not JSON body
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(apiLimiter);

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
