import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

type DbInstance = ReturnType<typeof drizzle<typeof schema>>
let _db: DbInstance | undefined

export function getDb(): DbInstance {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL not set")
    _db = drizzle(neon(url), { schema })
  }
  return _db
}
