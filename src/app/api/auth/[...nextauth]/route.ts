import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Usuario temporal en memoria para testing
const TEMP_ADMIN = {
  email: 'admin@flowy.app',
  password: '$2a$12$LQv3c1yqBWVHxkd0LdJ.uywYmzUq3bQ9tQGC9RrKJJMZ9z7S9uK', // bcryptjs hash de "admin"
  name: 'Administrador',
  id: 'temp-admin-id'
}

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar'
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Special case for admin user (temporal workaround)
        if (credentials.email === 'admin@flowy.app') {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            TEMP_ADMIN.password
          )

          if (isPasswordValid) {
            return {
              id: TEMP_ADMIN.id,
              email: TEMP_ADMIN.email,
              name: TEMP_ADMIN.name,
              image: null,
            }
          }
        }

        // Try database for other users
        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
          }
        } catch (dbError) {
          console.error('Database error, using fallback:', dbError)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  }
})

export { handler as GET, handler as POST }