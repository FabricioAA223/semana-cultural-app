"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import AdminEquipos from "@/components/admin/admin-equipos"
import AdminResultados from "@/components/admin/admin-resultados"
import AdminCalendario from "@/components/admin/admin-calendario"

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = () => {
      const auth = localStorage.getItem("adminAuthenticated") === "true"
      setIsAuthenticated(auth)
      setIsLoading(false)

      if (!auth) {
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    router.push("/admin/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // No renderizar nada mientras redirige
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <header className="bg-zinc-800 border-b border-zinc-700 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white hover:bg-zinc-700"
          >
            <LogOut size={16} className="mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="equipos" className="w-full">
          <TabsList className="grid grid-cols-3 mb-5 bg-zinc-800 w-full h-fit">
            <TabsTrigger value="equipos" className="data-[state=active]:bg-zinc-700">
              Equipos
            </TabsTrigger>
            <TabsTrigger value="resultados" className="data-[state=active]:bg-zinc-700">
              Resultados
            </TabsTrigger>
            <TabsTrigger value="calendario" className="data-[state=active]:bg-zinc-700">
              Calendario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipos" className="mt-0">
            <AdminEquipos />
          </TabsContent>

          <TabsContent value="resultados" className="mt-0">
            <AdminResultados />
          </TabsContent>

          <TabsContent value="calendario" className="mt-0">
            <AdminCalendario />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
