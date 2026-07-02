import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const publicBackendUrlSchema = z.union([z.string().startsWith("/"), z.string().url()]);

export const env = createEnv({
  server: {
    BACKEND_URL: z.string().url().default("http://localhost:4000"),
    BACKEND_INTERNAL_API_KEY: z.string().min(1).optional(),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_BACKEND_URL: publicBackendUrlSchema.default("/api/backend"),
  },
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  runtimeEnv: {
    BACKEND_URL: process.env.BACKEND_URL,
    BACKEND_INTERNAL_API_KEY: process.env.BACKEND_INTERNAL_API_KEY,
    CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
});
