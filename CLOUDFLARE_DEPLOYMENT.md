# Flowy - Cloudflare Pages Deployment Guide

## 🚀 Despliegue en Cloudflare Pages

### Requisitos Previos

1. **Cuentas necesarias:**
   - [Cloudflare Pages](https://dash.cloudflare.com/pages)
   - [GitHub](https://github.com)
   - [PlanetScale](https://planetscale.com) (Base de datos PostgreSQL)
   - [Google Cloud Console](https://console.cloud.google.com) (OAuth)
   - [Stripe](https://dashboard.stripe.com) (Pagos)

### 1. Configuración de Base de Datos

**PlanetScale (Recomendado):**
```bash
# 1. Crear cuenta en PlanetScale
# 2. Crear nueva base de datos "flowy"
# 3. Obtener connection string
# Formato: postgresql://user:password@host:port/database
```

### 2. Configuración de Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear nuevo proyecto o seleccionar existente
3. Ir a "APIs & Services" > "Credentials"
4. Crear "OAuth 2.0 Client ID"
5. Agregar dominio autorizado: `https://your-domain.pages.dev`
6. Copiar Client ID y Client Secret

### 3. Configuración de Stripe

1. Ir a [Stripe Dashboard](https://dashboard.stripe.com)
2. Crear cuenta o iniciar sesión
3. Obtener API keys (modo live para producción)
4. Configurar webhooks para confirmación de pagos

### 4. Despliegue en Cloudflare Pages

#### Opción A: Vía GitHub (Recomendado)

1. **Subir código a GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare deployment"
   git push origin main
   ```

2. **Configurar Cloudflare Pages:**
   - Ir a [Cloudflare Pages](https://dash.cloudflare.com/pages)
   - Click "Create a project"
   - Conectar repositorio GitHub
   - Configurar build settings:
     ```
     Framework preset: Next.js
     Build command: npm run build
     Build output directory: out
     Root directory: /
     ```

3. **Variables de Entorno:**
   Agregar en Settings > Environment variables:
   ```
   NEXTAUTH_URL=https://your-domain.pages.dev
   NEXTAUTH_SECRET=your-secret-key
   DATABASE_URL=postgresql://user:pass@host/db
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   STRIPE_PUBLIC_KEY=pk_live_your-stripe-key
   STRIPE_SECRET_KEY=sk_live_your-stripe-key
   ```

#### Opción B: Vía Wrangler CLI

1. **Instalar Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Autenticar:**
   ```bash
   wrangler login
   ```

3. **Desplegar:**
   ```bash
   wrangler pages deploy out --project-name flowy
   ```

### 5. Configuración Post-Despliegue

1. **Dominio Personalizado:**
   - En Cloudflare Pages > Settings > Custom domains
   - Agregar tu dominio personalizado

2. **Analytics:**
   - Activar Cloudflare Analytics
   - Configurar Google Analytics si se desea

3. **Monitoreo:**
   - Configurar alertas de errores
   - Monitorear rendimiento con Cloudflare Analytics

### 6. Verificación

Después del despliegue, verificar:

- [ ] La aplicación carga correctamente
- [ ] Autenticación con Google funciona
- [ ] Creación de eventos/tareas funciona
- [ ] Pagos con Stripe funcionan
- [ ] Base de datos se conecta correctamente
- [ ] PWA funciona en móvil

### Troubleshooting

**Errores Comunes:**

1. **Build Error - Images:**
   ```
   Error: Image optimization requires Node.js runtime
   ```
   Solución: Las imágenes están configuradas como `unoptimized: true`

2. **Database Connection:**
   ```
   Error: Can't reach database server
   ```
   Solución: Verificar `DATABASE_URL` y firewall de PlanetScale

3. **OAuth Redirect:**
   ```
   Error: redirect_uri_mismatch
   ```
   Solución: Agregar dominio exacto en Google Cloud Console

4. **Stripe Webhooks:**
   ```
   Error: Webhook signature verification failed
   ```
   Solución: Configurar webhook secret en variables de entorno

### Soporte

- **Documentación de Cloudflare Pages:** https://developers.cloudflare.com/pages
- **Documentación de Next.js:** https://nextjs.org/docs
- **Soporte de PlanetScale:** https://planetscale.com/docs

---

## 🎉 ¡Listo para producción!

Tu aplicación Flowy está ahora optimizada para Cloudflare Pages con:

✅ Edge Runtime para máximo rendimiento  
✅ Build optimizado para producción  
✅ Configuración de variables de entorno  
✅ Base de datos PostgreSQL escalable  
✅ Sistema de pagos integrado  
✅ Autenticación segura  
✅ PWA listo para móvil  

**Tiempo estimado de despliegue:** 15-30 minutos