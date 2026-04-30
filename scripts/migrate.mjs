import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Source .env.local or export it before running.")
  process.exit(1)
}

const sql = neon(DATABASE_URL)

const migration = readFileSync("./drizzle/0000_lumpy_amphibian.sql", "utf-8")

const statements = migration
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean)

console.log(`Running ${statements.length} statements...`)

for (const statement of statements) {
  try {
    await sql.query(statement)
    console.log("✓", statement.slice(0, 60).replace(/\n/g, " "))
  } catch (err) {
    if (err.message?.includes("already exists")) {
      console.log("⚠ already exists, skipping:", statement.slice(0, 60).replace(/\n/g, " "))
    } else {
      throw err
    }
  }
}

console.log("✅ Migration complete")
