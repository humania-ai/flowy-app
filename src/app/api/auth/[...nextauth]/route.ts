// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
//import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Usuario temporal en memoria para testing
const TEMP_ADMIN = {
  email: 'admin@flowy.app',
  password: '$2b$12$axdRWn/ZiAC4iC3rr6rKEu02pv4aAAxvY0urI.vwKqAnnXWqE/2P2', // bcryptjs hash de "admin"
  name: 'Administrador',
  id: 'temp-admin-id'
}

// 1. Crea una constante para tus opciones y expórtala
export const authOptions = {
//  adapter: PrismaAdapter(db),
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

        // Para otros usuarios, intentar con la BD (con error handling)
        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            },
            select: { // Mantén este select
            id: true,
            name: true,
            email: true,
            avatar: true,
            password: true, // Ahora esto funciona
          }

          })

          if (!user || !user.password) {
            console.log('User not found or no password')
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('User password invalid')
            return null
          }

          console.log('User login successful')
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
   /**
     * @param  {object}  token     Decrypted JSON Web Token
     * @param  {object}  user      User object      (solo disponible en el primer sign-in)
     * @param  {object}  account   Provider account (solo disponible en el primer sign-in con OAuth)
     * @return {object}            JSON Web Token that will be saved
     */
    async jwt({ token, user, account }) {
      // 1. Si el usuario inicia sesión por primera vez (con cualquier proveedor), `user` existe.
      if (user) {
        token.id = user.id; // Guardamos el ID del usuario en el token
        token.name = user.name;
        token.email = user.email;
      }

      // 2. Si es un proveedor OAuth, `account` también existe. Guardamos los tokens de acceso.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      
      return token;
    },

    /**
     * @param  {object} session      Session object
     * @param  {object} token        User object    (si usas strategy: "jwt")
     * @return {object}              Session object that will be returned to the client
     */
    async session({ session, token }) {
      // 3. Pasamos la información del token a la sesión que se usa en el cliente.
      if (token && session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/signin'
  }
}

// 2. Pasa la constante exportada a NextAuth
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }