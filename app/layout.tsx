// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'Semana Cultural Los Ángeles y San Josecito',
  description: 'Página oficial de la Semana Cultural Los Ángeles y San Josecito 2025',
  keywords: ['Semana Cultural', 'Clasificación', 'Los Ángeles y San Josecito', 'Semana recreativa y deportiva', 'Semana cultural 2025', 'Semana Los Angeles y San Josecito 2025', '2025'],
  other: {
    'google-site-verification': '8EyjH7a1Z9EWnsCHDwfnNq4D4_aSmtPL2jjpz--YZ6o',
  },
  openGraph: {
    title: 'Semana Cultural 2025',
    description: 'Página oficial de la Semana Cultural Los Ángeles y San Josecito 2025',
    url: 'https://semana-cultural.vercel.app',
    siteName: 'Semana Cultural Los Ángeles y San Josecito',
    images: [
      {
        url: 'icons/logo-semana-cultural.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Semana Cultural 2025',
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
        <meta name="author" content="Fabricio Alvarado" />
        <link rel="apple-touch-icon" href="/icons/logo-semana-cultural.png" />
      </head>
      <body className="bg-zinc-900 text-white pb-14">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
