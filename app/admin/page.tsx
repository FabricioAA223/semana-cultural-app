"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si el administrador está autenticado
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"

    // Redirigir según el estado de autenticación
    if (isAuthenticated) {
      router.push("/admin/dashboard")
    } else {
      router.push("/admin/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="animate-pulse text-white">Cargando...</div>
    </div>
  )
}
