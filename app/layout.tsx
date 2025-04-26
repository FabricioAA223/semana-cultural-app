// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'Semana Cultural 2025',
  description: 'App para control de puntuaciones de la Semana Cultural',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tabla de Clasificación',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="apple-touch-icon" href="/icons/logo-semana-cultural.png" />
      </head>
      <body className="bg-zinc-900 text-white pb-14">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
