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
- DATABASE_URL : dans `.env.local` uniquement (ne JAMAIS commiter — voir alerte sécurité ci-dessous)

## 🚨 ALERTE SÉCURITÉ (à traiter dès que possible)

Le `DATABASE_URL` complet (avec mot de passe `npg_GIW2AEFdT4wa`) a été commité en clair dans `scripts/migrate.mjs` sur GitHub. Le mot de passe est désormais **public**. À faire :

1. Aller sur https://console.neon.tech/ → Settings → Reset password
2. Mettre le nouveau `DATABASE_URL` dans `.env.local` et dans Vercel → Environment Variables
3. (Optionnel mais propre) Réécrire l'historique git pour supprimer la fuite : `git filter-repo --path scripts/migrate.mjs --invert-paths` puis force-push

Le script `scripts/migrate.mjs` a été corrigé pour lire `process.env.DATABASE_URL`.

## Branche de développement

Branche active actuelle : `claude/setup-wedding-app-BGwSF` (côté Claude Code web).
Branche historique mentionnée précédemment : `claude/wedding-planning-app-1eRVJ`.
Production sur Vercel : à confirmer via dashboard.
Ne pas merger sur main sans validation explicite d'Amir.

## 🐛 BUG Vercel 404 NOT_FOUND — guide de résolution

### Endpoint de diagnostic ajouté
`GET /api/health` est public (proxy.ts l'exclut de l'auth) et retourne `{ ok: true, env: { database, authSecret, authUrl, google } }` sans dépendre de la DB ni d'OAuth. Utiliser pour isoler le problème :

```
curl -i https://wedding-ten-topaz-12.vercel.app/api/health
```

- **404** → Vercel ne route pas vers la fonction → problème projet Vercel (Root Dir, Production Branch, project disconnecté de GitHub)
- **500** → Le code tourne mais une env var critique est manquante → vérifier Environment Variables
- **200** → Le déploiement est sain ; si la home `/` 404, c'est uniquement le proxy auth qui redirige

### Plan de résolution recommandé (le plus rapide)

Le projet Vercel actuel est dans un état corrompu (404 même après promotion). **Solution la plus fiable : recréer le projet.**

1. **Vercel** → Project `wedding` → Settings → Advanced → **Delete Project**
2. **Vercel** → Add New → Project → Import depuis GitHub `amirorfia-web/Wedding-`
3. Pendant l'import :
   - **Framework preset** : Next.js (auto-détecté)
   - **Root Directory** : `./` (vide, NE PAS mettre `Wedding-`)
   - **Production Branch** : choisir la branche active (ex `main` ou `claude/setup-wedding-app-BGwSF`)
   - **Environment Variables** : copier les 5 vars (voir `.env.example`)
4. Deploy → attendre Ready → tester `https://<nouveau-projet>.vercel.app/api/health`
5. Si `/api/health` répond 200 → mettre à jour `AUTH_URL` avec l'URL finale + ajouter le redirect Google OAuth `https://<nouveau-projet>.vercel.app/api/auth/callback/google`
6. Redéployer

### Si on veut tenter de réparer l'existant avant suppression

1. **Settings → Git** : vérifier que le repo est bien connecté ; si "Disconnected", reconnecter
2. **Settings → General** : Framework = Next.js, Root Directory vide, Node 20+
3. **Deployments** → cliquer le dernier "Ready" → "..." → **Redeploy** (sans cocher "use existing build cache")
4. Si toujours 404 : passer à la suppression/recréation

## Prochaine session — par où reprendre

1. **Rotation du mot de passe Neon** (alerte sécurité)
2. **Résoudre Vercel** via recréation projet (cf. plan ci-dessus)
3. Une fois `/api/health` qui répond 200 sur l'URL prod → tester le login Google des deux comptes
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
