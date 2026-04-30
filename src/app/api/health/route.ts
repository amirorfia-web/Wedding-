import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    ok: true,
    runtime: "nodejs",
    env: {
      database: Boolean(process.env.DATABASE_URL),
      authSecret: Boolean(process.env.AUTH_SECRET),
      authUrl: Boolean(process.env.AUTH_URL),
      google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    timestamp: new Date().toISOString(),
  })
}
