"use client"

import { motion } from "motion/react"
import { Trash2, MapPin, Users, TrendingUp, AlertTriangle, CheckCircle, Edit2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Scenario,
  REGIONS,
  NIVEAUX,
  totalCout,
  type CoutPoste,
} from "@/lib/types"

interface ScenarioCardProps {
  scenario: Scenario
  budgetMax: number
  onDelete: (id: string) => void
  onEdit: (scenario: Scenario) => void
  index: number
}

const POSTES_LABELS: Record<keyof CoutPoste, string> = {
  traiteur: "Traiteur",
  lieu: "Lieu",
  fleurs: "Fleurs & déco",
  photo: "Photo / vidéo",
  musique: "Musique",
  tenue: "Tenues",
  transport: "Transport",
  hebergement: "Hébergement",
  faire_part: "Faire-parts",
  divers: "Divers",
}

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
}

export function ScenarioCard({ scenario, budgetMax, onDelete, onEdit, index }: ScenarioCardProps) {
  const cout = totalCout(scenario.cout_estime)
  const pct = Math.min((cout / budgetMax) * 100, 100)
  const reste = budgetMax - cout
  const coutParInvite = Math.round(cout / scenario.nb_invites)
  const region = REGIONS[scenario.region]
  const niveau = NIVEAUX[scenario.niveau]
  const isOver = cout > budgetMax
  const isWarning = pct > 80 && !isOver

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      layout
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Bande couleur en haut */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"
          style={{ background: scenario.couleur }}
        />

        <CardHeader className="pt-6 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl font-semibold leading-tight truncate">
                {scenario.nom}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{region.emoji} {region.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(scenario)}
                aria-label="Modifier"
              >
                <Edit2 className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(scenario.id)}
                aria-label="Supprimer"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <Users className="size-3" />
              {scenario.nb_invites} invités
            </Badge>
            <Badge
              className="text-xs"
              style={{ background: `${scenario.couleur}22`, color: scenario.couleur, border: `1px solid ${scenario.couleur}44` }}
            >
              {niveau.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Coût total + ratio */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-display font-semibold" style={{ color: isOver ? "hsl(0 84% 60%)" : "hsl(var(--foreground))" }}>
                {fmt(cout)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{fmt(coutParInvite)} / invité</p>
            </div>
            <div className="text-right">
              {isOver ? (
                <div className="flex items-center gap-1 text-destructive text-sm font-medium">
                  <AlertTriangle className="size-4" />
                  {fmt(Math.abs(reste))} de dépassement
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                  <CheckCircle className="size-4" />
                  {fmt(reste)} restant
                </div>
              )}
            </div>
          </div>

          {/* Barre de budget */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Budget utilisé</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  background: isOver
                    ? "linear-gradient(90deg, hsl(0 72% 55%), hsl(15 80% 55%))"
                    : isWarning
                    ? "linear-gradient(90deg, hsl(38 90% 55%), hsl(45 90% 60%))"
                    : `linear-gradient(90deg, ${scenario.couleur}, ${scenario.couleur}cc)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
              />
              {/* Marqueur budget max */}
              <div className="absolute right-0 top-0 h-full w-0.5 bg-foreground/30" />
            </div>
          </div>

          {/* Décomposition postes — top 4 */}
          <div className="space-y-1.5">
            {(Object.entries(scenario.cout_estime) as [keyof CoutPoste, number][])
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([poste, montant]) => {
                const partPct = Math.round((montant / cout) * 100)
                return (
                  <Tooltip key={poste}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-default">
                        <span className="text-xs text-muted-foreground w-24 shrink-0">{POSTES_LABELS[poste]}</span>
                        <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary/60"
                            initial={{ width: 0 }}
                            animate={{ width: `${partPct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + index * 0.05 }}
                          />
                        </div>
                        <span className="text-xs font-medium w-16 text-right shrink-0">{fmt(montant)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{partPct}% du total</TooltipContent>
                  </Tooltip>
                )
              })}
          </div>

          {/* Avantages région */}
          <div className="pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {region.avantages.map((a) => (
                <span key={a} className="text-xs bg-accent text-accent-foreground rounded-full px-2 py-0.5">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
