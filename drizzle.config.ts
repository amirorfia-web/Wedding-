import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Remplacer 'pooler' par direct pour les migrations (drizzle-kit)
    url: (process.env.DATABASE_URL ?? "").replace("-pooler", ""),
  },
})
