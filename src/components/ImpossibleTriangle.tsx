"use client"

import { motion } from "motion/react"
import { type Scenario, REGIONS, totalCout } from "@/lib/types"

interface ImpossibleTriangleProps {
  scenarios: Scenario[]
  budgetMax: number
}

function getTriangleCoords(size: number) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const angle = (deg: number) => (deg * Math.PI) / 180
  return {
    top: { x: cx + r * Math.cos(angle(-90)), y: cy + r * Math.sin(angle(-90)) },
    bottomLeft: { x: cx + r * Math.cos(angle(150)), y: cy + r * Math.sin(angle(150)) },
    bottomRight: { x: cx + r * Math.cos(angle(30)), y: cy + r * Math.sin(angle(30)) },
  }
}

function lerp2D(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, wa: number, wb: number, wc: number) {
  const total = wa + wb + wc
  return {
    x: (a.x * wa + b.x * wb + c.x * wc) / total,
    y: (a.y * wa + b.y * wb + c.y * wc) / total,
  }
}

export function ImpossibleTriangle({ scenarios, budgetMax }: ImpossibleTriangleProps) {
  const size = 280
  const { top, bottomLeft, bottomRight } = getTriangleCoords(size)

  const getScenarioPoint = (s: Scenario) => {
    const cout = totalCout(s.cout_estime)
    const coutParInvite = REGIONS[s.region].cout_par_invite[s.niveau]
    const premiumRegions = ["toscane", "leman"]
    const isPremium = premiumRegions.includes(s.region)

    const wBudget = Math.max(0, Math.min(1, (budgetMax - cout) / budgetMax))
    const wInvites = s.nb_invites / 500
    const wLieu = isPremium ? 0.8 : coutParInvite > 200 ? 0.5 : 0.2

    return lerp2D(top, bottomLeft, bottomRight, wBudget, wInvites, wLieu)
  }

  const trianglePath = `M ${top.x} ${top.y} L ${bottomLeft.x} ${bottomLeft.y} L ${bottomRight.x} ${bottomRight.y} Z`

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="font-display text-lg font-semibold text-center">
        Triangle d&apos;impossibilité
      </h3>
      <p className="text-xs text-muted-foreground text-center max-w-[220px]">
        Choisir deux côtés, c&apos;est sacrifier le troisième.
      </p>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(38 62% 42%)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(340 30% 82%)" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Triangle rempli */}
          <path d={trianglePath} fill="url(#triGrad)" stroke="hsl(38 62% 42%)" strokeWidth="1.5" strokeOpacity="0.6" />

          {/* Labels sommets */}
          <text x={top.x} y={top.y - 14} textAnchor="middle" className="text-[10px]" fill="hsl(var(--foreground))" fontSize="11" fontWeight="600">
            BUDGET
          </text>
          <text x={bottomLeft.x - 8} y={bottomLeft.y + 20} textAnchor="middle" className="text-[10px]" fill="hsl(var(--foreground))" fontSize="11" fontWeight="600">
            INVITÉS
          </text>
          <text x={bottomRight.x + 8} y={bottomRight.y + 20} textAnchor="middle" className="text-[10px]" fill="hsl(var(--foreground))" fontSize="11" fontWeight="600">
            LIEU PREMIUM
          </text>

          {/* Points scénarios */}
          {scenarios.map((s, i) => {
            const pt = getScenarioPoint(s)
            return (
              <motion.g key={s.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}>
                <circle cx={pt.x} cy={pt.y} r={10} fill={s.couleur} fillOpacity={0.25} />
                <circle cx={pt.x} cy={pt.y} r={5} fill={s.couleur} />
                <text x={pt.x + 8} y={pt.y - 8} fontSize="9" fill={s.couleur} fontWeight="700">
                  {s.nom.slice(0, 12)}
                </text>
              </motion.g>
            )
          })}
        </svg>
      </div>

      <p className="text-xs text-muted-foreground italic text-center max-w-[240px]">
        Plus un point est proche d&apos;un sommet, plus ce critère est satisfait — au détriment des deux autres.
      </p>
    </div>
  )
}
