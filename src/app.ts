import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { healthRouter } from "./routes/health";
import { errorHandler, notFound } from "./middleware/errors";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: "100kb" }));
  app.use(rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: true, legacyHeaders: false }));

  app.use("/health", healthRouter);
  // Routes a ajouter, dans cet ordre : /spaces, /bookings, /qr  (voir openapi.yaml)

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
