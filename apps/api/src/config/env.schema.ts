import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://postgres:postgres@localhost:5432/autodm?schema=public'),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(8).default('supersecret_change_me_in_production_12345678'),

  // SMTP Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default('AutoDM <noreply@autodm.com>'),
});

export type Env = z.infer<typeof envSchema>;
