# Wedding Planning App

App perso pour aider Amir et sa fiancée à planifier leur mariage. **Aujourd'hui : phase de pré-décision** (lieu, date, format) — l'app n'est pas un planner classique, c'est un **simulateur de scénarios** pour prendre des décisions chiffrées en connaissance de cause.

## Contexte mariage (intentions actuelles)

- **Date** : à planifier, idéalement dans moins d'un an
- **Budget** : 20k€ (potentiellement extensible — l'app doit le révéler)
- **Invités** : 100 minimum, cible 300-400
- **Lieux envisagés** : Toscane, Suisse (Léman), ou plus loin si besoin
- **Tone** : ils veulent un truc grandiose

⚠️ **Réalité à intégrer** : 20k pour 300-400 invités en Toscane/Suisse = ~50-65€/invité, alors que le coût moyen réel dans ces régions est 150-400€/invité. L'app doit forcer l'arbitrage : soit moins d'invités, soit autre destination, soit augmenter le budget.

## Phase actuelle : pré-décision

L'app doit servir AVANT TOUT à choisir entre plusieurs scénarios. Une fois la décision lieu+date prise, on pivote vers un planner classique.

### Modules prioritaires (sprint 1)

1. **Simulateur de scénarios** — comparer côte-à-côte (lieu, invités, niveau, coût estimé, reste budget)
2. **Calculateur de coût détaillé** — décomposition par poste avec ratios €/invité par région pré-remplis
3. **Moteur de priorités & arbitrages** :
   - Liste d'invités par tiers (P1/P2/P3)
   - Pondération de critères (slider 0-10) par les deux partenaires
   - Score automatique de chaque scénario
   - Visualisateur "triangle d'impossibilité" (budget / invités / lieu premium)
   - Mode décision assistée (AHP — comparaisons par paires)
   - Vue "regrets minimaux" (qui tu n'invites pas, ce que tu perds)
   - Détection des désaccords entre partenaires

### Modules ultérieurs (post-décision)

- Catalogue de lieux candidats + pipeline de devis
- Liste d'invités complète + RSVP en ligne
- Site invités public
- Plan de table interactif
- Timeline jour J, playlist collaborative, galerie photo

## Stack technique

- **Frontend** : Next.js 15 + React + Tailwind
- **UI** : shadcn/ui
- **Animations** : Motion.dev (via skill `motion-dev-animations`)
- **Backend/DB** : Supabase (auth, Postgres, storage, RLS)
- **Hébergement** : Vercel
- **Charts** : Tremor ou Recharts

## Skills installés (`.claude/skills/`)

À utiliser activement pendant le développement :

- **`ui-ux-pro-max`** — direction visuelle, palettes, fontes (essentiel pour ton "grandiose")
- **`motion-dev-animations`** — animations du triangle d'arbitrages, transitions de scénarios
- **`brand`** — créer l'identité visuelle du couple (réutilisable pour faire-part, site invités)
- **`design-system`** — tokens et composants cohérents
- **`ui-styling`** — shadcn + Tailwind exécution
- **`design`** — logo + slides + banners
- **`banner-design`** — assets sociaux et faire-part
- **`slides`** — présentations (utile pour pitcher les scénarios à la fiancée/famille)

## Branche de développement

Toujours développer sur `claude/wedding-planning-app-1eRVJ`. Ne pas merger sur main sans validation explicite d'Amir.

## Prochaine session — par où reprendre

1. Configurer Supabase (créer le projet, récupérer les clés)
2. Bootstrapper Next.js dans le repo (`npx create-next-app@latest`)
3. Installer shadcn/ui + Tailwind + Motion
4. Schéma DB initial : `couples`, `scenarios`, `guests` (avec `tier`), `criteria` (avec poids partenaire 1 + 2), `vendors`
5. Implémenter le **Simulateur de scénarios** + **Calculateur de coût** en premier
6. Puis le **Moteur de priorités** (le différenciant de l'app)
7. Déployer sur Vercel pour usage immédiat

## Notes de style

- App responsive mobile-first (utilisée souvent au tel)
- Bilingue FR/EN éventuellement (FR par défaut)
- Mode collaboratif : Amir et sa fiancée voient les mêmes données en temps réel
