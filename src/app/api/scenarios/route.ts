import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getDb } from "@/lib/db"
import { scenarios } from "@/lib/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

const COUPLE_ID = "couple-amir-rojda"

async function assertAuth() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session
}

export async function GET() {
  const session = await assertAuth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const rows = await getDb()
    .select()
    .from(scenarios)
    .where(eq(scenarios.coupleId, COUPLE_ID))
    .orderBy(scenarios.createdAt)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await assertAuth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const { nom, region, lieuNom, nbInvites, niveau, coutEstime, couleur } = body

  if (!nom || !region || !niveau || !coutEstime) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
  }

  const [created] = await getDb().insert(scenarios).values({
    coupleId: COUPLE_ID,
    nom,
    region,
    lieuNom: lieuNom ?? "",
    nbInvites,
    niveau,
    coutEstime,
    couleur,
    statut: "actif",
  }).returning()

  return NextResponse.json(created, { status: 201 })
}
