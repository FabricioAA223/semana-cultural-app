"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"

// PIN de administrador (en una aplicación real, esto estaría en el servidor)
const ADMIN_PIN = "210625"

export default function AdminLoginPage() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simular una verificación con retraso para dar sensación de seguridad
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (pin === ADMIN_PIN) {
      // Guardar estado de autenticación en localStorage (en una app real usaríamos cookies seguras o JWT)
      localStorage.setItem("adminAuthenticated", "true")
      router.push("/admin/dashboard")
    } else {
      setError("PIN incorrecto. Inténtalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-zinc-700 bg-zinc-800">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <CardTitle className="text-2xl text-center text-white">Acceso Administrador</CardTitle>
            <div className="w-5"></div> {/* Espaciador para centrar el título */}
          </div>
          <p className="text-zinc-400 text-sm text-center">Ingresa tu PIN de administrador para continuar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="Ingresa tu PIN"
                  className="pl-9 bg-zinc-700 border-zinc-600 text-white"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? "Verificando..." : "Acceder"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t border-zinc-700 flex justify-center">
          <p className="text-xs text-zinc-400">Este panel es solo para administradores autorizados</p>
        </CardFooter>
      </Card>
    </div>
  )
}
