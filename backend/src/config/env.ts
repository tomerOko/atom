import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'envs', 'local.env') });

const configSchema = z.object({
  PORT: z.string().transform(Number),
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.string().transform(Number),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_USE_SSL: z.string().transform(val => val === 'true'),
  MINIO_REGION: z.string(),
  RABBITMQ_URL: z.string(),
  MONGODB_URI: z.string(),
  MONGODB_DB_NAME: z.string().default('helmet_detection'),
});

export const config = configSchema.parse(process.env);
