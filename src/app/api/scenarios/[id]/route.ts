import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb } from "@/lib/db"
import { scenarios } from "@/lib/schema"
import { eq, and } from "drizzle-orm"

export const dynamic = "force-dynamic"

const COUPLE_ID = "couple-amir-rojda"

async function assertAuth() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAuth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { nom, region, lieuNom, nbInvites, niveau, coutEstime, couleur, statut, notes } = body

  const [updated] = await getDb()
    .update(scenarios)
    .set({ nom, region, lieuNom: lieuNom ?? "", nbInvites, niveau, coutEstime, couleur, statut, notes, updatedAt: new Date() })
    .where(and(eq(scenarios.id, id), eq(scenarios.coupleId, COUPLE_ID)))
    .returning()

  if (!updated) return NextResponse.json({ error: "Scénario introuvable" }, { status: 404 })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAuth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params

  await getDb()
    .delete(scenarios)
    .where(and(eq(scenarios.id, id), eq(scenarios.coupleId, COUPLE_ID)))

  return NextResponse.json({ ok: true })
}
