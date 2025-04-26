// components/ClientLayout.tsx
"use client"

import { usePathname } from 'next/navigation'
import Navbar from '@/components/NavBar'
import { DataProvider } from '@/context/DataContext'
import { Toaster } from 'sonner'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <DataProvider>
      {children}
      {!isAdminRoute && <Navbar />}
      <Toaster richColors position="top-center" />
    </DataProvider>
  )
}
