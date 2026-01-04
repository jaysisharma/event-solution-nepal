import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().url().min(1, "DATABASE_URL is required"),
    AUTH_SECRET: z.string().min(12, "AUTH_SECRET must be at least 12 characters long").optional(), // Optional for now to not break dev, but should be required in prod
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    NEXT_PUBLIC_GA_ID: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
// Note: We use safeParse to avoid crashing the build if envs are missing during static analysis,
// but we verify success for runtime safety.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error(
        '❌ Invalid environment variables:',
        JSON.stringify(parsed.error.format(), null, 2)
    );
    // In production, we want to fail hard
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment variables');
    }
}

export const env = parsed.data || process.env;
