import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Asegúrate que esta ruta sea correcta
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Flowy - Tu Agenda Inteligente",
  description: "Organiza tu vida con calendario, tareas y sincronización con Google Calendar",
  keywords: ["flowy", "agenda", "calendario", "tareas", "whatsapp", "productividad", "móvil", "google calendar"],
  authors: [{ name: "Flowy Team" }],
  icons: {
    icon: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flowy",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Flowy - Tu Agenda Inteligente",
    description: "Organiza tu vida con calendario, tareas y sincronización con Google Calendar",
    url: "/",
    siteName: "Flowy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowy - Tu Agenda Inteligente",
    description: "Organiza tu vida con calendario, tareas y sincronización con Google Calendar",
  },
};

// 1. Haz la función asíncrona
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 2. Obtén la sesión en el servidor
  const session = await getServerSession(authOptions);
  // ¡AÑADE ESTE LOG!
  console.log('🔍 [layout.tsx] Session from getServerSession:', session);
    

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Flowy" />
        <link rel="apple-touch-icon" href="/logo-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen`}
      >
        {/* 3. Pasa la sesión como prop a Providers */}
        <Providers session={session}>
          {children}
          <Toaster />
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}