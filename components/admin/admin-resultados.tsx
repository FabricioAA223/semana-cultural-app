"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Save, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useData } from "@/context/DataContext"
import { Posicion, Team } from "@/types"
import { getColorByTeamName } from "@/utils/equiposColors"
import { collection, doc, getDocs, increment, updateDoc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Checkbox } from "../ui/checkbox"

// Tipo para los resultados
type PosicionWithIndex = {
  posicion: number
  puntos: number
  equiposColors: string[]
}

export default function AdminResultados() {
  const { teams, games, refreshData } = useData();
  const [actividadSeleccionada, setActividadSeleccionada] = useState("")
  const [jugado, setJugado] = useState(false);
  const [jugadoOriginal, setJugadoOriginal] = useState(false);
  const [posicionesOriginal, setPosicionesOriginal] = useState<PosicionWithIndex[]>([])
  const [posiciones, setPosiciones] = useState<PosicionWithIndex[]>([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (actividadSeleccionada) {
      setLoading(true)

      const resultadosActividad = games.find((game) => game.id === actividadSeleccionada)?.calificacion || []

      const nuevasPosiciones = resultadosActividad.map((pos: Posicion, index) => ({
        posicion: index + 1,
        puntos: pos.puntos,
        equiposColors: pos.equipo ?? [],
      }))
      setPosiciones(nuevasPosiciones)
      setPosicionesOriginal(nuevasPosiciones)

      const jugado = games.find((game) => game.id === actividadSeleccionada)?.jugado || false
      setJugadoOriginal(jugado)
      setJugado(jugado)

      setLoading(false)
    }
  }, [games, actividadSeleccionada])

  const handlePuntosChange = (posicion: number, puntos: number) => {
    setPosiciones(posiciones.map((pos) => (pos.posicion === posicion ? { ...pos, puntos: puntos } : pos)))
  }

  const handleAgregarEquipo = (posicion: number, equipoColor: string) => {
    setPosiciones(
      posiciones.map((pos) =>
        pos.posicion === posicion ? { ...pos, equiposColors: [...pos.equiposColors, equipoColor] } : pos,
      ),
    )
  }

  const handleQuitarEquipo = (posicion: number, equipoColor: string) => {
    setPosiciones(
      posiciones.map((pos) =>
        pos.posicion === posicion ? { ...pos, equiposColors: pos.equiposColors.filter((id) => id !== equipoColor) } : pos,
      ),
    )
  }

  const handleGuardarResultados = async () => {
    setGuardando(true)

    // Validar que no haya equipos duplicados en diferentes posiciones
    const equiposPorPosicion = new Map<string, number>()
    let hayDuplicados = false

    posiciones.forEach((pos) => {
      pos.equiposColors.forEach((equipoId) => {
        if (equiposPorPosicion.has(equipoId)) {
          hayDuplicados = true
        } else {
          equiposPorPosicion.set(equipoId, pos.posicion)
        }
      })
    })

    if (hayDuplicados) {
      toast.error("Error al guardar", {
        description: "Un equipo no puede estar asignado a más de una posición.",
      })
      setGuardando(false)
      return
    }

    try {
      const docRef = doc(db, "Games", actividadSeleccionada);
      const updateData = {
        calificacion: posiciones.map((pos) => ({ equipo: pos.equiposColors, puntos: pos.puntos })),
        jugado: jugado
      };

      await updateDoc(docRef, updateData);

      const huboCambioJugado = jugado !== jugadoOriginal;
      const huboCambioPosiciones = posiciones !== posicionesOriginal;

      if (huboCambioJugado || (huboCambioPosiciones && jugado)) {
        await actualizarPuntajesGenerales(
          actividadSeleccionada,
          jugado,
          jugadoOriginal,
          posiciones,
          posicionesOriginal
        );
      }

      toast.success("Resultados guardados", {
        description: "Los resultados han sido actualizados correctamente.",
      });

      // Actualizamos el estado original para futuras comparaciones
      setJugadoOriginal(jugado);
      setPosicionesOriginal(posiciones)
    } catch (error) {
      toast.error("Error al guardar", {
        description: "Ocurrió un error al intentar guardar los resultados.",
      });
      console.error("Error al guardar:", error);
    } finally {
      setGuardando(false);
    }
  };

  const calcularTendencias = (
    teamsAnteriores: Team[], // Lista original de equipos con sus puntos anteriores
    teamsActualizados: Team[], // Lista actualizada de equipos con nuevos puntos
  ) => {
    // Ordenar equipos anteriores por puntos (descendente)
    const rankingAnterior = [...teamsAnteriores]
      .sort((a, b) => b.score - a.score)
      .map((team, index) => ({ ...team, posicionAnterior: index + 1 }));
  
    // Ordenar equipos actualizados por puntos (descendente)
    const rankingActual = [...teamsActualizados]
      .sort((a, b) => b.score - a.score)
      .map((team, index) => ({ ...team, posicionActual: index + 1 }));
  
    // Combinar la información y calcular tendencias
    return rankingActual.map(teamActual => {
      const teamAnterior = rankingAnterior.find(t => t.id === teamActual.id);
      const posicionAnterior = teamAnterior?.posicionAnterior || teamActual.posicionActual;
      const posicionActual = teamActual.posicionActual;
  
      let tendencia = posicionActual - posicionAnterior
      let diferenciaPuntos = teamActual.score - (teamAnterior?.score || 0)
  
      return {
        id: teamActual.id,
        tendencia,
        posicionAnterior,
        posicionActual,
        puntosAnteriores: teamAnterior?.score,
        puntosActuales: teamActual.score,
        diferenciaPuntos
      };
    })
  };

  const actualizarPuntajesGenerales = async (
    actividad: string,
    jugadoActual: boolean,
    jugadoAnterior: boolean,
    posicionesActuales: PosicionWithIndex[],
    posicionesOriginales?: PosicionWithIndex[]
  ) => {
    const batch = writeBatch(db);
  
    // Caso 1: Cambio en estado jugado (de no jugado a jugado)
    if (jugadoActual && !jugadoAnterior) {
      // Sumar puntos a todos los equipos
      for (const posicion of posicionesActuales) {
        for (const equipoId of posicion.equiposColors) {
          const equipoRef = doc(db, "Teams", equipoId);
          batch.update(equipoRef, {
            score: increment(posicion.puntos)
          });
        }
      }
      // Calcular nuevos puntos para determinar tendencias
      const teamsRef = collection(db, 'Teams');
      const snapshot = await getDocs(teamsRef);
      const teamsActualizados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

      const tendencias = calcularTendencias(teams, teamsActualizados);
    
      tendencias.forEach(({ id, tendencia }) => {
        const teamRef = doc(db, 'Teams', id);
        batch.update(teamRef, { tendencia });
      });

      await actualizarHistorialTendencias(actividad, tendencias);
    }
    // Caso 2: Cambio en estado jugado (de jugado a no jugado)
    else if (!jugadoActual && jugadoAnterior && posicionesOriginales) {
      // Restar puntos que habían sido sumados previamente
      for (const posicion of posicionesOriginales) {
        for (const equipoId of posicion.equiposColors) {
          const equipoRef = doc(db, "Teams", equipoId);
          batch.update(equipoRef, {
            score: increment(-posicion.puntos)
          });
        }
      }
    }
    // Caso 3: Cambio en posiciones con juego jugado
    else if (jugadoActual && posicionesOriginales) {
      // Primero revertimos los puntos originales (restamos)
      for (const posicion of posicionesOriginales) {
        for (const equipoId of posicion.equiposColors) {
          const equipoRef = doc(db, "Teams", equipoId);
          batch.update(equipoRef, {
            score: increment(-posicion.puntos)
          });
        }
      }
  
      // Luego aplicamos los nuevos puntos (sumamos)
      for (const posicion of posicionesActuales) {
        for (const equipoId of posicion.equiposColors) {
          const equipoRef = doc(db, "Teams", equipoId);
          batch.update(equipoRef, {
            score: increment(posicion.puntos)
          });
        }
      }
    }


  
    try {
      await batch.commit();
      await refreshData()
      
      return true;
    } catch (error) {
      console.error("Error al actualizar puntajes:", error);
      throw error;
    }
  };

  const actualizarHistorialTendencias = async (gameId: string, tendencias: { id: string; tendencia: number; posicionAnterior: number; posicionActual: number; puntosAnteriores: number | undefined; puntosActuales: number; diferenciaPuntos: number; }[]) => {
    const batch = writeBatch(db);
    const timestamp = new Date().toISOString();
  
    tendencias.forEach(({ id, tendencia, posicionAnterior, posicionActual, puntosAnteriores, puntosActuales, diferenciaPuntos }) => {
      const historialRef = doc(db, 'Teams', id, 'historial', gameId);
      batch.set(historialRef, {
        fecha: timestamp,
        juegoId: gameId,
        posicionAnterior,
        posicionActual,
        cambioPosicion: tendencia,
        puntosAnteriores,
        puntosActuales,
        diferenciaPuntos,
      }, { merge: true });
    });

    await batch.commit();
  };

  // Obtener equipos disponibles (no asignados a otras posiciones)
  const getEquiposDisponibles = () => {
    const equiposAsignados = new Set<string>()

    posiciones.forEach((pos) => {
      pos.equiposColors.forEach((id) => {
        equiposAsignados.add(id)
      })
    })

    return teams.filter((equipo) => !equiposAsignados.has(equipo.id))
  }

  return (
    <div>
      <Card className="border-zinc-700 bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Registro de Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Selecciona una actividad</label>
              <Select value={actividadSeleccionada} onValueChange={setActividadSeleccionada}>
                <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                  <SelectValue placeholder="Selecciona una actividad" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-700 border-zinc-600 text-white">
                  {games.map((actividad) => (
                    <SelectItem key={actividad.id} value={actividad.id} className="focus:bg-zinc-600 focus:text-white">
                      {actividad.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {actividadSeleccionada && (
              <>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-zinc-300 pb-2 border-b border-zinc-700">
                      <div className="col-span-2 text-center">Posición</div>
                      <div className="col-span-3 text-center">Puntos</div>
                      <div className="col-span-7">Equipos</div>
                    </div>

                    {posiciones.map((posicion) => (
                      <div
                        key={posicion.posicion}
                        className="space-y-3 border-b border-zinc-700 pb-4 mb-4 last:border-0"
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-2 text-center">
                            <div className="bg-zinc-700 border border-zinc-600 rounded-md py-2 font-bold text-white">
                              {posicion.posicion}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              min="0"
                              value={posicion.puntos}
                              onChange={(e) =>
                                handlePuntosChange(posicion.posicion, Number.parseInt(e.target.value) || 0)
                              }
                              className="bg-zinc-700 border-zinc-600 text-white text-center h-9"
                            />
                          </div>
                          <div className="col-span-7">
                            {posicion.equiposColors.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {posicion.equiposColors.map((equipoId) => {
                                  const equipo = teams.find((e) => e.id === equipoId)
                                  return (
                                    <Badge
                                      key={equipoId}
                                      className="flex items-center gap-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-700"
                                      style={{ borderLeftColor: getColorByTeamName(equipoId), borderLeftWidth: "3px" }}
                                    >
                                      <span>{equipo?.name}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1 text-zinc-400 hover:text-red-500 hover:bg-transparent"
                                        onClick={() => handleQuitarEquipo(posicion.posicion, equipoId)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="text-zinc-400 text-sm mb-2">No hay equipos asignados</div>
                            )}

                            {getEquiposDisponibles().length > 0 && (
                              <Select
                                onValueChange={(value) => {
                                  const equipoId = value
                                  if (equipoId) {
                                    handleAgregarEquipo(posicion.posicion, equipoId)
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white h-9">
                                  <SelectValue placeholder="Agregar equipo" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-700 border-zinc-600 text-white">
                                  {getEquiposDisponibles().map((equipo) => (
                                    <SelectItem
                                      key={equipo.id}
                                      value={equipo.id.toString()}
                                      className="focus:bg-zinc-600 focus:text-white"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: getColorByTeamName(equipo.id) }}
                                        ></div>
                                        <span>{equipo.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) 
                            // : (
                            //   <div className="text-zinc-400 text-xs italic">
                            //     No hay más equipos disponibles para asignar
                            //   </div>
                            // )
                            }
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="jugado-checkbox"
                        checked={jugado}
                        onCheckedChange={(checked: boolean) => setJugado(checked)}
                        className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        style={{ minWidth: '20px', minHeight: '20px' }}
                      />
                      <label
                        htmlFor="jugado-checkbox"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300"
                      >
                        Actividad jugada
                      </label>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={handleGuardarResultados}
                        disabled={guardando || (posicionesOriginal == posiciones && jugado == jugadoOriginal)}
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
                            Guardar resultados
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
