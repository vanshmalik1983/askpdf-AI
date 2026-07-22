import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      logger.info(
        `AskPDF AI API running on port ${env.port} [${env.nodeEnv}]`
      );
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully...");

      server.close(() => {
        logger.info("Server closed successfully.");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start the application.", error);
    process.exit(1);
  }
}

bootstrap();