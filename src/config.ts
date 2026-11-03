import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  QR_SIGNING_KEY: z.string().min(32, "QR_SIGNING_KEY doit faire au moins 32 caracteres"),
});

const env = schema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  corsOrigins: env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter((o) => o && o !== "*"),
  qrSigningKey: env.QR_SIGNING_KEY,
};
