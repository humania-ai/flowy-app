# Flowy - Cloudflare Pages Configuration

## 🚀 Configuración para Cloudflare Pages

### Opción 1: Usar Cloudflare Pages Functions (Recomendado)

Para desplegar con API routes funcionales:

1. **Configurar `next.config.ts`:**
   ```typescript
   const nextConfig = {
     output: "standalone",
     images: { unoptimized: true },
     experimental: {
       serverComponentsExternalPackages: ['@prisma/client'],
     },
   }
   ```

2. **Estructura de funciones:**
   ```
   functions/
   └── api/
       └── [[...path]].ts
   ```

3. **Variables de entorno en Cloudflare:**
   - `NEXTAUTH_URL=https://your-domain.pages.dev`
   - `NEXTAUTH_SECRET=your-secret`
   - `DATABASE_URL=postgresql://...`
   - `GOOGLE_CLIENT_ID=...`
   - `GOOGLE_CLIENT_SECRET=...`
   - `STRIPE_PUBLIC_KEY=...`
   - `STRIPE_SECRET_KEY=...`

### Opción 2: Despliegue Estático (Sin API routes)

Si solo necesitas el frontend estático:

1. **Configurar `next.config.ts`:**
   ```typescript
   const nextConfig = {
     output: "export",
     trailingSlash: true,
     images: { unoptimized: true },
   }
   ```

2. **Usar APIs externas** para las funcionalidades del backend

### Instrucciones de Despliegue

#### Vía GitHub (Recomendado):

1. **Subir a GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Cloudflare Pages"
   git push origin main
   ```

2. **Configurar en Cloudflare Pages:**
   - Framework: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Node.js version: `18.x`

3. **Configurar Functions:**
   - Habilitar Functions en Cloudflare Pages
   - Las API routes se convertirán automáticamente en Functions

#### Variables de Entorno Requeridas:

```bash
# Autenticación
NEXTAUTH_URL=https://your-domain.pages.dev
NEXTAUTH_SECRET=your-super-secret-key

# Base de datos
DATABASE_URL=postgresql://user:pass@host/db

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_PUBLIC_KEY=pk_live_your-stripe-key
STRIPE_SECRET_KEY=sk_live_your-stripe-key
```

### Servicios Externos Necesarios:

1. **Base de datos:** PlanetScale (PostgreSQL)
2. **Autenticación:** Google OAuth
3. **Pagos:** Stripe
4. **Dominio:** Cloudflare (opcional)

### Pasos Siguientes:

1. Crear cuenta en PlanetScale y configurar base de datos
2. Configurar Google OAuth para tu dominio
3. Configurar Stripe para pagos
4. Desplegar en Cloudflare Pages
5. Configurar dominio personalizado (opcional)

### Testing:

Después del despliegue, probar:
- ✅ Carga de la aplicación
- ✅ Autenticación con Google
- ✅ Creación de eventos/tareas
- ✅ Proceso de pago
- ✅ Funcionalidad PWA

---

## 🎯 Recomendación

**Usa la Opción 1 (Functions)** para tener todas las funcionalidades de Flowy funcionando en Cloudflare Pages con backend completo.