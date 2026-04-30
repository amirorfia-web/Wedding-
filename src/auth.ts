import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { getDb } from "@/lib/db"
import { accounts, sessions, users, verificationTokens, coupleMembers } from "@/lib/schema"
import { eq } from "drizzle-orm"

const ALLOWED_EMAILS = ["amir.orfia@gmail.com", "rojda.yapici@gmail.com"]
const COUPLE_ID = "couple-amir-rojda"

function createAdapter() {
  try {
    return DrizzleAdapter(getDb(), {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    })
  } catch {
    return undefined
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!ALLOWED_EMAILS.includes(user.email ?? "")) return false

      if (user.id) {
        const db = getDb()
        const existing = await db
          .select()
          .from(coupleMembers)
          .where(eq(coupleMembers.userId, user.id))
          .limit(1)

        if (existing.length === 0) {
          await db.insert(coupleMembers).values({
            coupleId: COUPLE_ID,
            userId: user.id,
          }).onConflictDoNothing()
        }
      }

      return true
    },
    async session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
