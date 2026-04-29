"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type Region,
  type NiveauPrestation,
  type Scenario,
  REGIONS,
  NIVEAUX,
  calculerCoutDetaille,
  totalCout,
  COULEURS_SCENARIOS,
} from "@/lib/types"

interface ScenarioFormProps {
  open: boolean
  onClose: () => void
  onSave: (scenario: Scenario) => void
  initial?: Scenario
  budgetMax: number
  existingCount: number
}

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
}

export function ScenarioForm({ open, onClose, onSave, initial, budgetMax, existingCount }: ScenarioFormProps) {
  const [nom, setNom] = useState("")
  const [region, setRegion] = useState<Region>("toscane")
  const [lieuNom, setLieuNom] = useState("")
  const [nbInvites, setNbInvites] = useState(150)
  const [niveau, setNiveau] = useState<NiveauPrestation>("élégant")

  useEffect(() => {
    if (initial) {
      setNom(initial.nom)
      setRegion(initial.region)
      setLieuNom(initial.lieu_nom)
      setNbInvites(initial.nb_invites)
      setNiveau(initial.niveau)
    } else {
      setNom("")
      setRegion("toscane")
      setLieuNom("")
      setNbInvites(150)
      setNiveau("élégant")
    }
  }, [initial, open])

  const cout = calculerCoutDetaille(region, nbInvites, niveau)
  const total = totalCout(cout)
  const reste = budgetMax - total
  const isOver = total > budgetMax
  const coutParInvite = REGIONS[region].cout_par_invite[niveau]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const scenario: Scenario = {
      id: initial?.id ?? crypto.randomUUID(),
      nom: nom || `Scénario ${existingCount + 1}`,
      region,
      lieu_nom: lieuNom,
      nb_invites: nbInvites,
      niveau,
      budget_total: budgetMax,
      cout_estime: cout,
      statut: "actif",
      couleur: initial?.couleur ?? COULEURS_SCENARIOS[existingCount % COULEURS_SCENARIOS.length],
      created_at: initial?.created_at ?? new Date().toISOString(),
    }
    onSave(scenario)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 bottom-0 top-auto z-50 bg-card rounded-t-2xl shadow-2xl max-w-lg mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h2 className="font-display text-xl font-semibold">
                {initial ? "Modifier le scénario" : "Nouveau scénario"}
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh] px-6 py-5 space-y-5">
              {/* Nom */}
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom du scénario</Label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex : Toscane Luxe 200 pax"
                />
              </div>

              {/* Région */}
              <div className="space-y-1.5">
                <Label>Destination</Label>
                <Select value={region} onValueChange={(v) => setRegion(v as Region)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(REGIONS) as [Region, typeof REGIONS[Region]][]).map(([key, r]) => (
                      <SelectItem key={key} value={key}>
                        {r.emoji} {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lieu nom */}
              <div className="space-y-1.5">
                <Label htmlFor="lieu">Nom du lieu (optionnel)</Label>
                <Input
                  id="lieu"
                  value={lieuNom}
                  onChange={(e) => setLieuNom(e.target.value)}
                  placeholder="Ex : Villa San Martino"
                />
              </div>

              {/* Nombre d'invités */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Nombre d&apos;invités</Label>
                  <span className="text-sm font-semibold tabular-nums">{nbInvites}</span>
                </div>
                <Slider
                  min={30}
                  max={500}
                  step={10}
                  value={[nbInvites]}
                  onValueChange={([v]) => setNbInvites(v)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30</span>
                  <span className="text-primary">Cible : 300-400</span>
                  <span>500</span>
                </div>
              </div>

              {/* Niveau de prestation */}
              <div className="space-y-2">
                <Label>Niveau de prestation</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(NIVEAUX) as [NiveauPrestation, typeof NIVEAUX[NiveauPrestation]][]).map(([key, n]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNiveau(key)}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${
                        niveau === key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className="font-medium text-sm">{n.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Résumé estimé */}
              <div className={`rounded-xl p-4 space-y-2 ${isOver ? "bg-destructive/10 border border-destructive/30" : "bg-muted/60"}`}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coût estimé</span>
                  <span className={`font-semibold ${isOver ? "text-destructive" : ""}`}>{fmt(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coût / invité</span>
                  <span className="font-medium">{fmt(coutParInvite)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget restant</span>
                  <span className={`font-semibold ${isOver ? "text-destructive" : "text-emerald-600"}`}>
                    {isOver ? `−${fmt(Math.abs(reste))}` : fmt(reste)}
                  </span>
                </div>
                {isOver && (
                  <p className="text-xs text-destructive mt-1">
                    ⚠️ Ce scénario dépasse votre budget de {fmt(Math.abs(reste))}. Vous pouvez quand même le sauvegarder pour comparer.
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2">
                <Plus className="size-4" />
                {initial ? "Enregistrer les modifications" : "Ajouter ce scénario"}
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
