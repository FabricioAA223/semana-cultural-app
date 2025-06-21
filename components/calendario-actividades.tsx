"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Clock, MapPin, Users, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useData } from "@/context/DataContext"
import { Actividad } from "@/types"

const getColorEquipo = (colorCode: string) => {
  switch (colorCode) {
    case "lightblue":
      return "#0078d7"
    case "yellow":
      return "#b7b500"
    case "orange":
      return "#d35400"
    case "red":
      return "#c0392b"
    case "black":
      return "#000"
    case "green":
      return "#27ae60"
    case "purple":
      return "#8e44ad"
    case "white":
      return "#fff"
    default:
      return "#777777"
  }
}

// Función para formatear fecha
const formatearFecha = (fechaStr: string): string => {
  const fecha = new Date(fechaStr)
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC"
  })
}

// Componente para el badge de tipo de actividad
const TipoBadge = ({ tipo }: { tipo: string }) => {
  switch (tipo) {
    case "competencia":
      return <Badge className="bg-blue-600">Competencia</Badge>
    case "evento":
      return <Badge className="bg-purple-600">Evento</Badge>
    default:
      return <Badge>Otro</Badge>
  }
}

// Componente para el badge de tipo de actividad
const TipoCompetenciaBadge = ({ tipo }: { tipo: string }) => {
  switch (tipo) {
    case "enfrentamiento":
      return <Badge className="bg-amber-600">Duelos</Badge>
    case "otro":
      return <Badge>Otro</Badge>
    case "individual":
      return <Badge className="bg-lime-600">Individual</Badge>
    case "escenica":
      return <Badge className="bg-purple-600">Artística</Badge>
    case "todos":
      return null
    default:
      return <Badge className="bg-teal-600">Por grupos</Badge>
  }
}

// Agrupar actividades por fecha
const agruparPorFecha = (actividades: Actividad[]) => {
  const grupos: Record<string, Actividad[]> = {}

  actividades.forEach((actividad) => {
    if (!grupos[actividad.fecha]) {
      grupos[actividad.fecha] = []
    }
    grupos[actividad.fecha].push(actividad)
  })
  // Convertir a array ordenado por fecha
  return Object.entries(grupos)
    .sort(([fechaA], [fechaB]) => new Date(fechaA).getTime() - new Date(fechaB).getTime())
    .map(([fecha, acts], index) => {
      const diaNombre = new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', timeZone: "UTC" });
      return {
        fecha,
        nombre: `Día ${index + 1}`,
        dia: diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1), // Capitaliza
        actividades: acts
      }
    })
}


export default function CalendarioActividades() {
  const { teams, activities, loading } = useData();
  const [diaActivo, setDiaActivo] = useState("Día 1")
  const [actividadesFiltradas, setActividadesFiltradas] = useState<Actividad[]>([])
  const [diasActividades, setDiasActividades] = useState<{ fecha: string, dia: string, nombre: string, actividades: Actividad[] }[]>([])

  useEffect(() => {
    const agrupadas = agruparPorFecha(activities)
    setDiasActividades(agrupadas)
  }, [activities])

  // Filtrar actividades según la búsqueda y el día seleccionado
  useEffect(() => {
    const diaSeleccionado = diasActividades.find((dia) => dia.nombre === diaActivo)
    if (diaSeleccionado) {
      setActividadesFiltradas(diaSeleccionado.actividades.sort((a, b) => a.orden - b.orden))
    }
  }, [diasActividades, diaActivo])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getTeamName = (colorCode: string) => {
    const equipo = teams.find((e) => e.id === colorCode.charAt(0).toUpperCase() + colorCode.slice(1))
    return equipo ? equipo.name : "Equipo desconocido"
  }

  return (
    <div className="w-full mx-auto bg-zinc-900 text-white">
      <Card className="border-none bg-transparent rounded-none sm:rounded-lg sm:mx-auto sm:max-w-md">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Calendario de Actividades</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Tabs defaultValue="Día 1" className="w-full" onValueChange={setDiaActivo}>
            <TabsList className="grid grid-flow-col auto-cols-fr h-auto mb-4 bg-zinc-800 p-1 rounded-md w-full">
              {diasActividades.map((dia) => (
                <TabsTrigger
                  key={dia.nombre}
                  value={dia.nombre}
                  className="text-xs py-2 data-[state=active]:bg-zinc-700 grid gap-0"
                >
                  {dia.nombre}
                  <label style={{fontSize:'9px', color:'gray'}}>{dia.dia}</label>
                </TabsTrigger>
              ))}
            </TabsList>

            {diasActividades.map((dia) => (
              <TabsContent key={dia.nombre} value={dia.nombre} className="mt-0" style={{backgroundColor: 'transparent'}}>
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-blue-400 capitalize">{formatearFecha(dia.fecha)}</h2>
                </div>

                {actividadesFiltradas.length > 0 ? (
                  <div className="space-y-3">
                    {actividadesFiltradas.map((actividad) => (
                      <Collapsible key={actividad.id} className="rounded-lg border border-zinc-600 overflow-hidden">
                        <div className="bg-zinc-800 p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{actividad.titulo}</h3>
                              <div className="flex gap-2">
                                <div className="flex flex-col sm:flex-row sm:gap-4 mt-1 text-sm text-zinc-300 flex-1">
                                  <div className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    <span>{actividad.lugar}</span>
                                  </div>
                                  {actividad.hora.length > 0 &&
                                    <div className="flex items-center gap-1">
                                      <Clock size={14} />
                                      <span>{actividad.hora}</span>
                                    </div>
                                  }
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                  <TipoBadge tipo={actividad.tipo} />
                                  {actividad.tipo == "competencia" && <TipoCompetenciaBadge tipo={actividad.tipoCompetencia || "otro"} />}
                                </div>
                              </div>
                            </div>
                            <div className="w-5">
                            {actividad.enfrentamientos && actividad.tipo === "competencia" && (
                              <CollapsibleTrigger className="rounded-full p-1 hover:bg-zinc-700">
                                <ChevronDown className="h-5 w-5 text-zinc-400" />
                              </CollapsibleTrigger>
                            )}
                            </div>
                          </div>
                        </div>

                        {actividad.enfrentamientos && actividad.tipo === "competencia" && (
                          <CollapsibleContent>
                            <div className="p-3 bg-zinc-900 border-t border-zinc-700">
                              <div className="mb-2 flex items-center gap-1">
                                <Users size={14} className="text-zinc-400" />
                                <span className="text-sm font-medium text-zinc-300">
                                  {actividad.tipoCompetencia === "enfrentamiento" 
                                  ? "Enfrentamientos:" 
                                  : actividad.tipoCompetencia === "grupal" 
                                  ? "Grupos de equipos:"
                                  : actividad.tipoCompetencia === "individual" || actividad.tipoCompetencia === "escenica" 
                                  ? "Orden de participación:"
                                  : <span className="italic">Participan todos los equipos en grupo</span>}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {actividad.tipoCompetencia === "enfrentamiento" &&
                                  (actividad.enfrentamientos.length > 0 ? (
                                    <div>
                                      {actividad.enfrentamientos.map((enfrentamiento, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-2 my-2 rounded-md bg-zinc-800"
                                        >
                                          <div className="flex items-center w-[45%]">
                                            <div
                                              className="w-2 h-10 rounded-l-md"
                                              style={{ backgroundColor: getColorEquipo(enfrentamiento.equipoA) }}
                                            ></div>
                                            <span className="ml-2 font-medium ">{getTeamName(enfrentamiento.equipoA)}</span>
                                          </div>
                                          <span className="text-zinc-400 w-[5%]">vs</span>
                                          <div className="flex items-center justify-end w-[45%]">
                                            <span className="mr-2 font-medium text-right">{getTeamName(enfrentamiento.equipoB)}</span>
                                            <div
                                              className="w-2 h-10 rounded-r-md"
                                              style={{ backgroundColor: getColorEquipo(enfrentamiento.equipoB) }}
                                            ></div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )
                                  :
                                  <label className="text-sm font-medium text-zinc-300 italic">Por definir...</label>
                                  )
                                }
                                {actividad.tipoCompetencia === "grupal" && actividad.grupos.length > 0 && (
                                  <div>
                                    <div className="space-y-3">
                                      {actividad.grupos.map((grupo, index) => (
                                        <div key={grupo.id} className="bg-zinc-700 p-2 rounded my-3">
                                          <h5 className="text-xs font-medium text-zinc-300 mb-2">Grupo {index + 1}</h5>
                                          <div className="flex flex-col flex-wrap gap-2">
                                            {grupo.equipos.map((equipoCode) => (
                                              <div
                                                key={equipoCode}
                                                className="flex items-center gap-1 bg-zinc-600 px-2 py-1 rounded text-xs"
                                              >
                                                <div
                                                  className="w-2 h-2 rounded-full"
                                                  style={{ backgroundColor: getColorEquipo(equipoCode) }}
                                                ></div>
                                                <span>{getTeamName(equipoCode)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {actividad.tipoCompetencia === "individual" || actividad.tipoCompetencia === "escenica" && actividad.grupos.length > 0 && (
                                  <div>
                                    <div className="space-y-3">
                                      {actividad.grupos.map((grupo) => (
                                        <div key={grupo.id} className="bg-zinc-700 p-2 rounded my-3">
                                          <div className="flex flex-col flex-wrap gap-2">
                                            {grupo.equipos.map((equipoCode, pos) => (
                                              <div
                                                key={equipoCode}
                                                className="flex items-center gap-1 bg-zinc-600 px-2 py-1 rounded text-xs"
                                              >
                                                <label className="bg-zinc-700 rounded py-1 px-2 mr-1">{pos +1}</label>
                                                <div
                                                  className="w-2 h-2 rounded-full"
                                                  style={{ backgroundColor: getColorEquipo(equipoCode) }}
                                                ></div>
                                                <span>{getTeamName(equipoCode)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-zinc-400 border border-zinc-700 rounded-lg bg-zinc-800/30">
                    No se encontraron actividades que coincidan con la búsqueda
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
