const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  MONGO_URI: z.string().min(1, 'MONGO_URI es obligatorio'),

  FRONTEND_URL: z.string().min(1, 'FRONTEND_URL es obligatorio'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET debe tener al menos 16 caracteres'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET debe tener al menos 16 caracteres'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  AUTH_MAX_FAILED_ATTEMPTS: z.coerce.number().int().positive().default(5),
  AUTH_LOCK_MINUTES: z.coerce.number().int().positive().default(15),

  EMAIL_VERIFICATION_EXPIRES_MINUTES: z.coerce.number().int().positive().default(60),
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().int().positive().default(30),

  COOKIE_NAME: z.string().default('refresh_token'),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional().default(''),

  SEED_ADMIN_FIRST_NAME: z.string().optional().default('Admin'),
  SEED_ADMIN_LAST_NAME: z.string().optional().default('Root'),
  SEED_ADMIN_EMAIL: z.string().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional(),

  LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

module.exports = {
  env,
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
};
