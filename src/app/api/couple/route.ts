import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { couples } from "@/lib/schema"
import { eq } from "drizzle-orm"

const COUPLE_ID = "couple-amir-rojda"

async function assertAuth() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session
}

export async function GET() {
  const session = await assertAuth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const [couple] = await db
    .select()
    .from(couples)
    .where(eq(couples.id, COUPLE_ID))
    .limit(1)

  return NextResponse.json(couple ?? { id: COUPLE_ID, budget: 20000 })
}

export async function PATCH(req: NextRequest) {
  const session = await assertAuth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { budget } = await req.json()
  if (typeof budget !== "number" || budget < 0) {
    return NextResponse.json({ error: "Budget invalide" }, { status: 400 })
  }

  const [updated] = await db
    .update(couples)
    .set({ budget })
    .where(eq(couples.id, COUPLE_ID))
    .returning()

  return NextResponse.json(updated)
}
