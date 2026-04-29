import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core"

// ── NextAuth required tables ──────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

// ── App tables ────────────────────────────────────────────────────────────────

export const couples = pgTable("couples", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  budget: integer("budget").notNull().default(20000),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const coupleMembers = pgTable(
  "couple_members",
  {
    coupleId: text("couple_id").notNull().references(() => couples.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.coupleId, t.userId] })]
)

export const scenarios = pgTable("scenarios", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  coupleId: text("couple_id").notNull().references(() => couples.id, { onDelete: "cascade" }),
  nom: text("nom").notNull(),
  region: text("region").notNull(),
  lieuNom: text("lieu_nom").default("").notNull(),
  nbInvites: integer("nb_invites").notNull(),
  niveau: text("niveau").notNull(),
  coutEstime: jsonb("cout_estime").notNull(),
  couleur: text("couleur").notNull(),
  statut: text("statut").notNull().default("actif"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
