import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        })
        if (!user) return null
        const valid = await bcrypt.compare(String(credentials.password), user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as { role?: unknown }).role = token.role
      return session
    },
  },
  pages: { signIn: "/login" },
})
