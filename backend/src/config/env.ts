import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'envs', 'local.env') });

const configSchema = z.object({
  PORT: z.string().transform(Number),
  SERVICE_NAME: z.string(),
  ENV: z.string(),
  LOGTAIL_SOURCE_TOKEN: z.string(),
  LOGTAIL_ENDPOINT: z.string(),
  LOG_LEVEL: z.string().transform(val => {
    val = val.toLowerCase();
    if (!['error', 'warn', 'log', 'debug', 'verbose'].includes(val)) {
      return 'log';
    }
    return val;
  }),
  LOG_MAX_LENGTH: z.string().transform(Number),
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.string().transform(Number),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_USE_SSL: z.string().transform(val => val === 'true'),
  MINIO_REGION: z.string(),
  RABBITMQ_URL: z.string(),
  PACKAGE_PREFIX: z.string(),
  MONGODB_URI: z.string(),
  MONGODB_DB_NAME: z.string().default('helmet_detection'),
  LOGSTASH_URL: z.string(),
  APM_SERVER_URL: z.string(),
  OPENAI_API_KEY: z.string(),
  JWT_SECRET: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  // Calendly API configuration
  CALENDLY_ACCESS_TOKEN: z.string().optional(),
  CALENDLY_ORGANIZATION_URI: z.string().optional(),
  CALENDLY_USER_URI: z.string().optional(),
  CALENDLY_WEBHOOK_URL: z.string().optional(),
});

export const config = configSchema.parse(process.env);
