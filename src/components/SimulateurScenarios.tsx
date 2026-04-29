"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Plus, Settings2, TrendingUp, AlertCircle, LogOut, Loader2 } from "lucide-react"
import { signOut } from "next-auth/react"
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

interface SimulateurProps {
  userName: string | null
  userImage: string | null
}

export function SimulateurScenarios({ userName, userImage }: SimulateurProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [budgetMax, setBudgetMax] = useState(20000)
  const [loadingScenarios, setLoadingScenarios] = useState(true)
  const [savingBudget, setSavingBudget] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editScenario, setEditScenario] = useState<Scenario | undefined>()
  const [showTriangle, setShowTriangle] = useState(false)
  const budgetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Charger couple + scénarios au montage
  useEffect(() => {
    async function load() {
      try {
        const [coupleRes, scenariosRes] = await Promise.all([
          fetch("/api/couple"),
          fetch("/api/scenarios"),
        ])
        if (coupleRes.ok) {
          const couple = await coupleRes.json()
          setBudgetMax(couple.budget)
        }
        if (scenariosRes.ok) {
          const rows = await scenariosRes.json()
          // Mapper les champs snake_case de la DB vers camelCase du frontend
          setScenarios(rows.map(dbToScenario))
        }
      } finally {
        setLoadingScenarios(false)
      }
    }
    load()
  }, [])

  // Sauvegarder le budget avec debounce (1.5s après le dernier slide)
  const handleBudgetChange = useCallback((value: number) => {
    setBudgetMax(value)
    if (budgetDebounceRef.current) clearTimeout(budgetDebounceRef.current)
    budgetDebounceRef.current = setTimeout(async () => {
      setSavingBudget(true)
      await fetch("/api/couple", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: value }),
      })
      setSavingBudget(false)
    }, 1500)
  }, [])

  async function handleSave(scenario: Scenario) {
    const isEdit = scenarios.some((s) => s.id === scenario.id)

    if (isEdit) {
      const res = await fetch(`/api/scenarios/${scenario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenarioToDb(scenario)),
      })
      if (res.ok) {
        const updated = dbToScenario(await res.json())
        setScenarios((prev) => prev.map((s) => s.id === updated.id ? updated : s))
      }
    } else {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenarioToDb(scenario)),
      })
      if (res.ok) {
        const created = dbToScenario(await res.json())
        setScenarios((prev) => [...prev, created])
      }
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/scenarios/${id}`, { method: "DELETE" })
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

  const activeScenarios = scenarios.filter((s) => s.statut === "actif")
  const scenariosOverBudget = activeScenarios.filter((s) => totalCout(s.cout_estime) > budgetMax)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Amir <span className="text-primary">&</span> Rojda
              </h1>
              <p className="text-xs text-muted-foreground">Simulateur de scénarios</p>
            </div>
            <div className="flex items-center gap-2">
              {userImage && (
                <img src={userImage} alt={userName ?? ""} className="size-7 rounded-full" />
              )}
              <Button
                size="sm"
                onClick={handleNewScenario}
                className="gap-1.5"
                disabled={activeScenarios.length >= 6}
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Nouveau</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground"
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="Déconnexion"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Budget slider */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4 text-primary" />
              <h2 className="font-semibold text-sm">Votre budget total</h2>
              {savingBudget && (
                <Loader2 className="size-3.5 text-muted-foreground animate-spin ml-auto" />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="font-display text-3xl font-semibold">{fmt(budgetMax)}</span>
                <span className="text-xs text-muted-foreground">Synchronisé avec Rojda</span>
              </div>
              <Slider
                min={5000}
                max={100000}
                step={1000}
                value={[budgetMax]}
                onValueChange={([v]) => handleBudgetChange(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 000 €</span>
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
                <strong>
                  {fmt(budgetMax / (activeScenarios.find((s) => s.nb_invites > 200)?.nb_invites ?? 1))}
                </strong>.
                En Toscane ou Suisse, le minimum réaliste est 150-400€/invité.
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

            {loadingScenarios ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Chargement des scénarios…</span>
              </div>
            ) : (
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
            )}
          </div>

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

// ── Helpers de mapping DB ↔ frontend ─────────────────────────────────────────

function dbToScenario(row: Record<string, unknown>): Scenario {
  return {
    id: row.id as string,
    nom: row.nom as string,
    region: row.region as Scenario["region"],
    lieu_nom: (row.lieu_nom ?? row.lieuNom ?? "") as string,
    nb_invites: (row.nb_invites ?? row.nbInvites) as number,
    niveau: row.niveau as Scenario["niveau"],
    budget_total: 20000,
    cout_estime: (row.cout_estime ?? row.coutEstime) as Scenario["cout_estime"],
    couleur: row.couleur as string,
    statut: (row.statut ?? "actif") as Scenario["statut"],
    notes: row.notes as string | undefined,
    created_at: row.created_at as string,
  }
}

function scenarioToDb(s: Scenario) {
  return {
    nom: s.nom,
    region: s.region,
    lieuNom: s.lieu_nom,
    nbInvites: s.nb_invites,
    niveau: s.niveau,
    coutEstime: s.cout_estime,
    couleur: s.couleur,
    statut: s.statut,
    notes: s.notes,
  }
}
