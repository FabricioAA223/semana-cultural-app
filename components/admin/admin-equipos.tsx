"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useData } from "@/context/DataContext"
import { Team } from "@/types"
import { getColorByTeamName } from "@/utils/equiposColors"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AdminEquipos() {
  const { teams, refreshData } = useData();
  const [equipos, setEquipos] = useState<Team[]>(teams)
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    setEquipos(teams)
  }, [teams])

  const handleNombreChange = (teamColor: string, nuevoNombre: string) => {
    setEquipos(equipos.map((equipo) => (equipo.id === teamColor ? { ...equipo, name: nuevoNombre } : equipo)))
  }

  const updateTeam = async (team: Team) => {
    let docRef = doc(db, "Teams", team.id);
    await updateDoc(docRef, {...team});
  }
  const handleGuardarCambios = async () => {
    setGuardando(true)

    equipos.map(async (equipo) => await updateTeam(equipo))
    await refreshData()
    toast.success("Cambios guardados", {
      description: "Los nombres de los equipos han sido actualizados correctamente.",
    })

    setGuardando(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <Card className="border-zinc-700 bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Gestión de Equipos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              Modifica los nombres de los equipos. Los colores se mantendrán igual.
            </p>

            <div className="grid gap-4">
              {equipos.map((equipo) => (
                <div key={equipo.id} className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: getColorByTeamName(equipo.id) }}></div>
                  <Input
                    value={equipo.name}
                    onChange={(e) => handleNombreChange(equipo.id, e.target.value)}
                    className="bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleGuardarCambios}
                disabled={guardando}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {guardando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
