import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const publicBackendUrlSchema = z.union([
  z.string().startsWith("/"),
  z.string().url(),
]);

export const env = createEnv({
  server: {
    BACKEND_URL: z.string().url().default("http://localhost:4000"),
  },
  client: {
    NEXT_PUBLIC_BACKEND_URL: publicBackendUrlSchema.default("/api/backend"),
  },
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  runtimeEnv: {
    BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
});
