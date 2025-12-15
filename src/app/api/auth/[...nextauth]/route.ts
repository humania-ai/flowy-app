import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Usuario temporal en memoria para testing
const TEMP_ADMIN = {
  email: 'admin@flowy.app',
  password: '$2b$12$axdRWn/ZiAC4iC3rr6rKEu02pv4aAAxvY0urI.vwKqAnnXWqE/2P2', // bcryptjs hash de "admin"
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
        console.log('Credentials received:', credentials?.email, 'password provided:', !!credentials?.password)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        // Special case for admin user (temporal workaround)
        if (credentials.email === 'admin@flowy.app') {
          console.log('Admin login attempt')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            TEMP_ADMIN.password
          )
          console.log('Admin password valid:', isPasswordValid)

          if (isPasswordValid) {
            console.log('Admin login successful')
            return {
              id: TEMP_ADMIN.id,
              email: TEMP_ADMIN.email,
              name: TEMP_ADMIN.name,
              image: null,
            }
          } else {
            console.log('Admin password invalid')
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
    signUp: '/auth/signup',
    error: '/auth/signin'
  }
})

export { handler as GET, handler as POST }