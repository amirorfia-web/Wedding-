# Wedding Planning App

App perso pour aider Amir et Rojda à planifier leur mariage. **Aujourd'hui : phase de pré-décision** (lieu, date, format) — l'app n'est pas un planner classique, c'est un **simulateur de scénarios** pour prendre des décisions chiffrées en connaissance de cause.

## Contexte mariage (intentions actuelles)

- **Date** : à planifier, idéalement dans moins d'un an
- **Budget** : 20k€ (potentiellement extensible — l'app doit le révéler)
- **Invités** : 100 minimum, cible 300-400
- **Lieux envisagés** : Toscane, Suisse (Léman), ou plus loin si besoin
- **Tone** : ils veulent un truc grandiose

⚠️ **Réalité à intégrer** : 20k pour 300-400 invités en Toscane/Suisse = ~50-65€/invité, alors que le coût moyen réel dans ces régions est 150-400€/invité. L'app doit forcer l'arbitrage : soit moins d'invités, soit autre destination, soit augmenter le budget.

## Stack technique (actuelle)

- **Frontend** : Next.js 16 + React + Tailwind v4
- **UI** : shadcn/ui (composants créés manuellement)
- **Animations** : Motion.dev
- **DB** : Neon (Postgres) + Drizzle ORM
- **Auth** : NextAuth v5 (Google OAuth) — whitelist amir.orfia@gmail.com + rojda.yapici@gmail.com
- **Hébergement** : Vercel
- **Charts** : Recharts (installé)

## Ce qui est fait (sprints 1 & 2)

### Sprint 1 ✅ — Simulateur de scénarios
- `src/components/SimulateurScenarios.tsx` — composant principal avec fetch API
- `src/components/ScenarioCard.tsx` — carte par scénario avec barres animées
- `src/components/ScenarioForm.tsx` — formulaire bottom-sheet animé
- `src/components/ImpossibleTriangle.tsx` — triangle SVG budget/invités/lieu
- `src/lib/types.ts` — types + données régions (Toscane, Léman, Paris, Maroc, Portugal)
- Design system : palette or/ivoire/ardoise, Playfair Display + Inter

### Sprint 2 ✅ — Infrastructure DB + Auth
- `src/lib/db.ts` — singleton lazy `getDb()` (important : ne pas revenir à l'initialisation module-level)
- `src/lib/schema.ts` — tables : users, accounts, sessions, verification_tokens, couples, couple_members, scenarios
- `src/auth.ts` — NextAuth Google + whitelist emails + liaison couple automatique
- `src/proxy.ts` — protection toutes routes (redirect /login si non connecté)
- `src/app/api/scenarios/route.ts` — GET/POST
- `src/app/api/scenarios/[id]/route.ts` — PUT/DELETE
- `src/app/api/couple/route.ts` — GET/PATCH (budget partagé)
- `src/app/login/page.tsx` — page login Google

### DB Neon
- Tables créées manuellement via SQL Editor Neon (le sandbox n'a pas accès réseau à Neon)
- Couple pré-créé : `INSERT INTO couples (id, budget) VALUES ('couple-amir-rojda', 20000)`
- DATABASE_URL : dans .env.local (ne pas commiter)

## Branche de développement

Toujours développer sur `claude/wedding-planning-app-1eRVJ`. Ne pas merger sur main sans validation explicite d'Amir.

## 🐛 BUG ACTUEL — Vercel 404 NOT_FOUND

### Symptôme
`https://wedding-ten-topaz-12.vercel.app` retourne `404: NOT_FOUND / Code: NOT_FOUND` même après promotion du déploiement "Ready".

### Ce qui a été essayé
- Build local : ✅ passe sans erreur
- Build sans env vars : ✅ passe (fix lazy db appliqué)
- Promotion du dernier déploiement "Ready" : 404 persiste
- Preview URL `wedding-4t90m6m2u-amir-ora-pulse.vercel.app` : aussi 404

### Hypothèses à vérifier en nouvelle session
1. **Settings Vercel → General** : vérifier Framework Preset = "Next.js", Root Directory = vide, Build Command = `npm run build`
2. **Settings Vercel → Git** : vérifier Production Branch = `claude/wedding-planning-app-1eRVJ`
3. Le 404 est au niveau Vercel routing (pas Next.js) — l'ID `fra1::xxx` indique un problème infrastructure, pas applicatif
4. Possible : le projet Vercel a été créé avec un Root Directory incorrect (ex: `Wedding-`)
5. Possible : env vars manquantes ou mal copiées côté Vercel

### Variables d'environnement Vercel à vérifier
Ces 5 variables doivent être présentes dans Settings → Environment Variables :
- `DATABASE_URL` — connection string Neon (dans .env.local)
- `AUTH_SECRET` — clé NextAuth (dans .env.local)
- `AUTH_URL` — `https://wedding-ten-topaz-12.vercel.app`
- `GOOGLE_CLIENT_ID` — dans Google Cloud Console
- `GOOGLE_CLIENT_SECRET` — dans Google Cloud Console

## Prochaine session — par où reprendre

1. **Résoudre le bug Vercel 404** (voir section ci-dessus)
2. Vérifier les settings Vercel (Root Directory, Framework Preset, Production Branch)
3. Une fois l'app accessible en prod → tester le login Google des deux comptes
4. Enchaîner sur **Sprint 3 — Moteur de priorités & arbitrages**

## Skills installés (`.claude/skills/`)

- **`ui-ux-pro-max`** — direction visuelle, palettes, fontes
- **`motion-dev-animations`** — animations
- **`brand`** — identité visuelle
- **`design-system`** — tokens et composants
- **`ui-styling`** — shadcn + Tailwind
- **`design`** — logo + slides + banners
- **`banner-design`** — assets sociaux
- **`slides`** — présentations

## Notes de style

- App responsive mobile-first (utilisée souvent au tel)
- FR par défaut
- Mode collaboratif : Amir et Rojda voient les mêmes données en temps réel
