import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  await connectDB();

  const server = app.listen(env.port, () => {
    logger.info(`AskPDF AI API running on port ${env.port} [${env.nodeEnv}]`);
  });

  // Graceful shutdown: let in-flight requests finish instead of dropping
  // connections when Render/PM2 sends SIGTERM during a redeploy.
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => process.exit(0));
  });
}

bootstrap();
