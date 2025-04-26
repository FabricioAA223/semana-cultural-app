"use client"

import { useEffect, useState } from "react"
import { ChevronUp, ChevronDown, Info, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getDownloadURL, ref } from "firebase/storage"
import { storage } from "@/lib/firebase" // Asegúrate que la ruta es correcta
import { useData } from "@/context/DataContext"
import { getColorByTeamName } from "@/utils/equiposColors"
import { TeamExtended } from "@/types"

export default function TeamRanking2() {
  const [teamsWithLogos, setTeamsWithLogos] = useState<TeamExtended[]>([])
  const { teams, loading } = useData();

  useEffect(() => {
    const cargarLogos = async () => {
      if (!teams || teams.length === 0) return

      const actualizados = await Promise.all(
        teams.map(async (equipo) => {
          try {
            const url = await getDownloadURL(ref(storage, `logos/${equipo.id}.png`)) // "Red", "Green", etc.
            return {
              ...equipo,
              logo: url,
              color: getColorByTeamName(equipo.id), // color dinámico
            }
          } catch (error) {
            console.error(`Error cargando logo de ${equipo.id}:`, error)
            return {
              ...equipo,
              logo: "/logo-placeholder.png",
              color: getColorByTeamName(equipo.id),
            }
          }
        })
      )

      setTeamsWithLogos(actualizados)
    }

    cargarLogos()
  }, [teams])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case "up":
        return <ChevronUp color="green" style={{margin:'auto'}}/>
      case "down":
        return <ChevronDown color="red" style={{margin:'auto'}}/>
      default:
        return <Minus color="lightgray" style={{margin:'auto'}}/>
    }
  }

  return (
    <div className="max-w-md text-white m-auto">
      <Card className="border-none bg-transparent gap-2">
        <CardHeader className="pt-2">
          <CardTitle className="text-2xl font-bold text-center text-white">Tabla de Clasificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-zinc-700">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800 text-zinc-300 text-sm">
                  <th className="px-2 text-left">
                    <div className="flex items-center">
                      <span className="mr-1">Pos</span>
                    </div>
                  </th>
                  <th className="px-2 text-left">
                    <div className="flex items-center">
                      <span className="mr-1">Equipo</span>
                    </div>
                  </th>
                  <th className="px-2 text-right">
                    <div className="flex items-center justify-end">
                      <span className="mr-1">Pts</span>
                    </div>
                  </th>
                  <th className="px-2 w-8 text-center m-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info size={14} style={{margin:'auto'}}/>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tendencia del equipo</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                </tr>
              </thead>
              <tbody>
                {teamsWithLogos.map((equipo, index) => (
                  <tr
                    key={index}
                    className="border-t border-zinc-700 hover:bg-zinc-800 transition-colors text-white"
                    style={{
                      background: `linear-gradient(90deg, ${equipo.color}22 0%, transparent 100%)`, height: '72px'
                    }}
                  >
                    <td className="py-3 font-bold text-center">{index + 1}</td>
                    <td className="py-3 px-2 relative">
                      <div className="flex items-center relative z-10">
                        <span className="font-medium">{equipo.name}</span>
                      </div>
                      <img
                        src={equipo.logo}
                        alt={`Logo de ${equipo.name}`}
                        className="absolute inset-0 opacity-10 object-contain w-full h-full"
                      />
                    </td>
                    <td className="py-3 px-2 text-right font-bold">{equipo.score}</td>
                    <td className="py-3 px-2 text-center">{getTendenciaIcon(equipo.trend)}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
