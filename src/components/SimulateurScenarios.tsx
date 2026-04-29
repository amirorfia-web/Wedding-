"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Plus, Settings2, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ScenarioCard } from "@/components/ScenarioCard"
import { ScenarioForm } from "@/components/ScenarioForm"
import { ImpossibleTriangle } from "@/components/ImpossibleTriangle"
import { type Scenario, totalCout } from "@/lib/types"

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
}

const SCENARIOS_DEMO: Scenario[] = [
  {
    id: "demo-1",
    nom: "Toscane Élégant 150",
    region: "toscane",
    lieu_nom: "Villa Terrazza",
    nb_invites: 150,
    niveau: "élégant",
    budget_total: 20000,
    cout_estime: {
      traiteur: 13200,
      lieu: 5940,
      fleurs: 2640,
      photo: 1980,
      musique: 1650,
      tenue: 1650,
      transport: 1320,
      hebergement: 2640,
      faire_part: 660,
      divers: 1320,
    },
    statut: "actif",
    couleur: "#C9A96E",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    nom: "Maroc Luxe 200",
    region: "maroc",
    lieu_nom: "Palais Rhoul",
    nb_invites: 200,
    niveau: "luxe",
    budget_total: 20000,
    cout_estime: {
      traiteur: 16000,
      lieu: 7200,
      fleurs: 3200,
      photo: 2400,
      musique: 2000,
      tenue: 2000,
      transport: 1600,
      hebergement: 3200,
      faire_part: 800,
      divers: 1600,
    },
    statut: "actif",
    couleur: "#9B8EC4",
    created_at: new Date().toISOString(),
  },
]

export function SimulateurScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>(SCENARIOS_DEMO)
  const [budgetMax, setBudgetMax] = useState(20000)
  const [formOpen, setFormOpen] = useState(false)
  const [editScenario, setEditScenario] = useState<Scenario | undefined>()
  const [showTriangle, setShowTriangle] = useState(false)

  const activeScenarios = scenarios.filter((s) => s.statut === "actif")
  const bestScenario = activeScenarios.reduce<Scenario | null>((best, s) => {
    const cout = totalCout(s.cout_estime)
    if (!best) return cout <= budgetMax ? s : null
    const bestCout = totalCout(best.cout_estime)
    return cout <= budgetMax && cout > bestCout ? s : best
  }, null)

  function handleSave(scenario: Scenario) {
    setScenarios((prev) => {
      const idx = prev.findIndex((s) => s.id === scenario.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = scenario
        return next
      }
      return [...prev, scenario]
    })
  }

  function handleDelete(id: string) {
    setScenarios((prev) => prev.filter((s) => s.id !== id))
  }

  function handleEdit(scenario: Scenario) {
    setEditScenario(scenario)
    setFormOpen(true)
  }

  function handleNewScenario() {
    setEditScenario(undefined)
    setFormOpen(true)
  }

  const scenariosOverBudget = activeScenarios.filter((s) => totalCout(s.cout_estime) > budgetMax)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Amir <span className="text-primary">&</span> Fiancée
              </h1>
              <p className="text-xs text-muted-foreground">Simulateur de scénarios</p>
            </div>
            <Button
              size="sm"
              onClick={handleNewScenario}
              className="gap-1.5"
              disabled={activeScenarios.length >= 6}
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nouveau</span>
            </Button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Budget slider */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4 text-primary" />
              <h2 className="font-semibold text-sm">Votre budget total</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="font-display text-3xl font-semibold">{fmt(budgetMax)}</span>
                <span className="text-xs text-muted-foreground">Glissez pour ajuster</span>
              </div>
              <Slider
                min={5000}
                max={100000}
                step={1000}
                value={[budgetMax]}
                onValueChange={([v]) => setBudgetMax(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 000 €</span>
                <span className="text-primary font-medium">Actuel : {fmt(budgetMax)}</span>
                <span>100 000 €</span>
              </div>
            </div>

            {scenariosOverBudget.length > 0 && (
              <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg p-3 text-xs">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  {scenariosOverBudget.length === 1
                    ? `"${scenariosOverBudget[0].nom}" dépasse votre budget.`
                    : `${scenariosOverBudget.length} scénarios dépassent votre budget.`}{" "}
                  Augmentez le budget ou ajustez les scénarios.
                </span>
              </div>
            )}
          </div>

          {/* Alert réalité budgétaire */}
          {budgetMax < 30000 && activeScenarios.some((s) => s.nb_invites > 200) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800"
            >
              <p className="font-semibold mb-1">💡 Réalité budgétaire</p>
              <p>
                Avec {fmt(budgetMax)} pour 200+ invités, le coût par personne est de{" "}
                <strong>{fmt(budgetMax / activeScenarios.find((s) => s.nb_invites > 200)!.nb_invites)}</strong>.
                En Toscane ou Suisse, le minimum réaliste est 150-400€/invité.
                Il faudra arbitrer : moins d&apos;invités, destination plus accessible, ou budget augmenté.
              </p>
            </motion.div>
          )}

          {/* Scénarios */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                Scénarios{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  ({activeScenarios.length}/6)
                </span>
              </h2>
              {activeScenarios.length >= 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setShowTriangle(!showTriangle)}
                >
                  <TrendingUp className="size-3.5" />
                  {showTriangle ? "Masquer" : "Triangle d'arbitrages"}
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showTriangle && activeScenarios.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card rounded-2xl p-6 shadow-sm border overflow-hidden"
                >
                  <ImpossibleTriangle scenarios={activeScenarios} budgetMax={budgetMax} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {activeScenarios.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 space-y-3"
                >
                  <p className="text-4xl">💍</p>
                  <p className="font-display text-lg text-muted-foreground">
                    Aucun scénario pour l&apos;instant
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Créez votre premier scénario pour commencer à comparer.
                  </p>
                  <Button onClick={handleNewScenario} className="mt-2 gap-2">
                    <Plus className="size-4" />
                    Créer un scénario
                  </Button>
                </motion.div>
              ) : (
                activeScenarios.map((s, i) => (
                  <ScenarioCard
                    key={s.id}
                    scenario={s}
                    budgetMax={budgetMax}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    index={i}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Bottom padding pour le form sheet */}
          <div className="h-8" />
        </main>

        <ScenarioForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setEditScenario(undefined)
          }}
          onSave={handleSave}
          initial={editScenario}
          budgetMax={budgetMax}
          existingCount={scenarios.length}
        />
      </div>
    </TooltipProvider>
  )
}
