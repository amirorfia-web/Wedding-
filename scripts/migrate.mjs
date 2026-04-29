import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const DATABASE_URL = "postgresql://neondb_owner:npg_GIW2AEFdT4wa@ep-winter-field-amtxsmoi-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const sql = neon(DATABASE_URL)

const migration = readFileSync("./drizzle/0000_lumpy_amphibian.sql", "utf-8")

// Split on drizzle's statement separator
const statements = migration
  .split("--> statement-breakpoint")
  .map(s => s.trim())
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
