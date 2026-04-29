export type Region = "toscane" | "leman" | "paris" | "maroc" | "portugal" | "custom"
export type NiveauPrestation = "essentiel" | "élégant" | "luxe" | "prestige"
export type StatutScenario = "actif" | "archivé"

export interface CoutPoste {
  lieu: number
  traiteur: number
  fleurs: number
  photo: number
  musique: number
  tenue: number
  transport: number
  hebergement: number
  faire_part: number
  divers: number
}

export interface Scenario {
  id: string
  nom: string
  region: Region
  lieu_nom: string
  nb_invites: number
  niveau: NiveauPrestation
  budget_total: number
  cout_estime: CoutPoste
  date_envisagee?: string
  notes?: string
  statut: StatutScenario
  couleur: string
  created_at: string
}

export interface RegionData {
  label: string
  emoji: string
  cout_par_invite: Record<NiveauPrestation, number>
  avantages: string[]
  inconvenients: string[]
  delai_min_mois: number
}

export const REGIONS: Record<Region, RegionData> = {
  toscane: {
    label: "Toscane, Italie",
    emoji: "🌿",
    cout_par_invite: {
      essentiel: 150,
      élégant: 220,
      luxe: 320,
      prestige: 500,
    },
    avantages: ["Cadre iconique", "Gastronomie sublime", "Lumière dorée"],
    inconvenients: ["Logistique complexe", "Hébergement dispersé", "Vols + transferts"],
    delai_min_mois: 12,
  },
  leman: {
    label: "Lac Léman, Suisse",
    emoji: "🏔️",
    cout_par_invite: {
      essentiel: 180,
      élégant: 280,
      luxe: 420,
      prestige: 650,
    },
    avantages: ["Paysage à couper le souffle", "Logistique facile", "Qualité de service premium"],
    inconvenients: ["Très onéreux", "Météo incertaine", "Formalités suisses"],
    delai_min_mois: 10,
  },
  paris: {
    label: "Paris & Île-de-France",
    emoji: "🗼",
    cout_par_invite: {
      essentiel: 120,
      élégant: 180,
      luxe: 280,
      prestige: 450,
    },
    avantages: ["Accessibilité maximale", "Prestataires en abondance", "Hôtels à proximité"],
    inconvenients: ["Manque d'exclusivité", "Circulation", "Concurrence forte"],
    delai_min_mois: 8,
  },
  maroc: {
    label: "Marrakech, Maroc",
    emoji: "🌴",
    cout_par_invite: {
      essentiel: 80,
      élégant: 130,
      luxe: 200,
      prestige: 320,
    },
    avantages: ["Budget accessible", "Décor somptueux", "Dépaysement total"],
    inconvenients: ["Vols longs haul", "Chaleur estivale", "Visa pour certains"],
    delai_min_mois: 9,
  },
  portugal: {
    label: "Alentejo, Portugal",
    emoji: "🍷",
    cout_par_invite: {
      essentiel: 100,
      élégant: 160,
      luxe: 240,
      prestige: 380,
    },
    avantages: ["Rapport qualité/prix", "Vignobles et quintas", "Vols directs faciles"],
    inconvenients: ["Moins connu", "Prestataires parfois limités", "Été très chaud"],
    delai_min_mois: 10,
  },
  custom: {
    label: "Destination personnalisée",
    emoji: "📍",
    cout_par_invite: {
      essentiel: 100,
      élégant: 170,
      luxe: 280,
      prestige: 450,
    },
    avantages: ["Flexibilité totale"],
    inconvenients: ["À définir"],
    delai_min_mois: 12,
  },
}

export const NIVEAUX: Record<NiveauPrestation, { label: string; description: string; multiplicateur: number }> = {
  essentiel: {
    label: "Essentiel",
    description: "Traiteur buffet, fleurs simples, DJ",
    multiplicateur: 1,
  },
  élégant: {
    label: "Élégant",
    description: "Repas assis, bouquets curatifs, groupe live",
    multiplicateur: 1.5,
  },
  luxe: {
    label: "Luxe",
    description: "Menu gastronomique, fleuriste réputé, orchestre",
    multiplicateur: 2.2,
  },
  prestige: {
    label: "Prestige",
    description: "Chef étoilé, décorateur international, performance live",
    multiplicateur: 3.5,
  },
}

export function calculerCoutDetaille(
  region: Region,
  nbInvites: number,
  niveau: NiveauPrestation
): CoutPoste {
  const coutParInvite = REGIONS[region].cout_par_invite[niveau]
  const base = coutParInvite * nbInvites

  return {
    traiteur: Math.round(base * 0.40),
    lieu: Math.round(base * 0.18),
    fleurs: Math.round(base * 0.08),
    photo: Math.round(base * 0.06),
    musique: Math.round(base * 0.05),
    tenue: Math.round(base * 0.05),
    transport: Math.round(base * 0.04),
    hebergement: Math.round(base * 0.08),
    faire_part: Math.round(base * 0.02),
    divers: Math.round(base * 0.04),
  }
}

export function totalCout(cout: CoutPoste): number {
  return Object.values(cout).reduce((a, b) => a + b, 0)
}

export const COULEURS_SCENARIOS = [
  "#C9A96E",
  "#9B8EC4",
  "#6EAFC9",
  "#C96E9B",
  "#6EC9A0",
  "#C9876E",
]
