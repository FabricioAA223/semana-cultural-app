"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Plus, Trash2, Clock, MapPin } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useData } from "@/context/DataContext"
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Actividad } from "@/types"

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
    .map(([fecha, acts]) => ({
      fecha,
      actividades: acts,
    }))
}

export default function AdminCalendario() {
  const { teams, activities, loading, refreshData } = useData();
  const [equipos, setEquipos] = useState<{id:number, nombre:string, colorCode:string}[]>([])
  // const [actividades, setActividades] = useState<Actividad[]>([])
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null)
  const [loading2, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [modoEdicion, setModoEdicion] = useState<"lista" | "editar" | "crear">("lista")
  const [actividadesAgrupadas, setActividadesAgrupadas] = useState<{ fecha: string; actividades: Actividad[] }[]>([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("")

  useEffect(() => {
    setLoading(true)

    const agrupadas = agruparPorFecha(activities)
    setActividadesAgrupadas(agrupadas)

    if (agrupadas.length > 0) {
      setFechaSeleccionada(agrupadas[0].fecha)
    }

    // Intentar cargar equipos desde contect
    if (teams) {
      const equipos = teams.map((team, index) => ({"id": index+1, "nombre": team.name, "colorCode":team.id.toLowerCase()}))
      console.log(equipos)
      setEquipos(equipos)
    }

    setLoading(false)
  }, [teams, activities])

  // Actualizar agrupación cuando cambian las actividades
  useEffect(() => {
    const agrupadas = agruparPorFecha(activities)
    setActividadesAgrupadas(agrupadas)
  }, [activities])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const crearNuevaActividad = () => {
    setActividadSeleccionada({
      id: `act${Date.now()}`,
      titulo: "",
      fecha: new Date().toISOString().split("T")[0],
      hora: "10:00 AM",
      lugar: "",
      tipo: "competencia",
      tipoCompetencia: "enfrentamiento",
      enfrentamientos: [],
      grupos: [],
    })
    setModoEdicion("crear")
  }

  const editarActividad = (actividad: Actividad) => {
    // Asegurarse de que la actividad tenga todos los campos necesarios
    const actividadCompleta = {
      ...actividad,
      tipoCompetencia: actividad.tipoCompetencia || (actividad.tipo === "competencia" ? "enfrentamiento" : undefined),
      grupos: actividad.grupos || [],
    }
    setActividadSeleccionada(actividadCompleta)
    setModoEdicion("editar")
  }

  const eliminarActividad = async(titulo: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta actividad?")) {
      const docRef = doc(db, "Activities", titulo);
      await deleteDoc(docRef);

      await refreshData();

      toast.success("Actividad eliminada", {
        description: "La actividad ha sido eliminada correctamente.",
      })
    }
  }

  const agregarEnfrentamiento = () => {
    if (actividadSeleccionada) {
      setActividadSeleccionada({
        ...actividadSeleccionada,
        enfrentamientos: [
          ...actividadSeleccionada.enfrentamientos,
          { id: `enf${Date.now()}`, equipoA: "", equipoB: "" },
        ],
      })
    }
  }

  const eliminarEnfrentamiento = (id: string) => {
    if (actividadSeleccionada) {
      setActividadSeleccionada({
        ...actividadSeleccionada,
        enfrentamientos: actividadSeleccionada.enfrentamientos.filter((enf) => enf.id !== id),
      })
    }
  }

  const actualizarEnfrentamiento = (id: string, campo: "equipoA" | "equipoB", valor: string) => {
    if (actividadSeleccionada) {
      setActividadSeleccionada({
        ...actividadSeleccionada,
        enfrentamientos: actividadSeleccionada.enfrentamientos.map((enf) =>
          enf.id === id ? { ...enf, [campo]: valor } : enf,
        ),
      })
    }
  }

  const agregarGrupo = () => {
    if (actividadSeleccionada) {
      setActividadSeleccionada({
        ...actividadSeleccionada,
        grupos: [...actividadSeleccionada.grupos, { id: `grp${Date.now()}`, equipos: [] }],
      })
    }
  }

  const eliminarGrupo = (id: string) => {
    if (actividadSeleccionada) {
      setActividadSeleccionada({
        ...actividadSeleccionada,
        grupos: actividadSeleccionada.grupos.filter((grp) => grp.id !== id),
      })
    }
  }

  const agregarEquipoAGrupo = (grupoId: string, equipoColorCode: string) => {
    if (actividadSeleccionada) {
      setActividadSeleccionada({
        ...actividadSeleccionada,
        grupos: actividadSeleccionada.grupos.map((grp) =>
          grp.id === grupoId ? { ...grp, equipos: [...grp.equipos, equipoColorCode] } : grp,
        ),
      })
    }
  }

  const eliminarEquipoDeGrupo = (grupoId: string, equipoColorCode: string) => {
    if (actividadSeleccionada) {
      setActividadSeleccionada({
        ...actividadSeleccionada,
        grupos: actividadSeleccionada.grupos.map((grp) =>
          grp.id === grupoId ? { ...grp, equipos: grp.equipos.filter((e) => e !== equipoColorCode) } : grp,
        ),
      })
    }
  }

  const handleInputChange = (campo: keyof Actividad, valor: string) => {
    if (actividadSeleccionada) {
      setActividadSeleccionada({
        ...actividadSeleccionada,
        [campo]: valor,
      } as Actividad)
    }
  }

  const guardarActividad = () => {
    if (!actividadSeleccionada) return

    // Validar campos requeridos
    if (
      !actividadSeleccionada.titulo ||
      !actividadSeleccionada.fecha ||
      !actividadSeleccionada.hora ||
      !actividadSeleccionada.lugar
    ) {
      toast.error("Error al guardar", {
        description: "Por favor completa todos los campos requeridos.",
      })
      return
    }

    // Validar que si es competencia, tenga tipo de competencia
    if (actividadSeleccionada.tipo === "competencia" && !actividadSeleccionada.tipoCompetencia) {
      toast.error("Error al guardar", {
        description: "Por favor selecciona el tipo de competencia.",
      })
      return
    }

    setGuardando(true)

    // Simulamos una llamada a Firebase para guardar la actividad
    const saveOrUpdateActivity = async () => {

      if (modoEdicion === "crear") {
        const docRef = doc(db, "Activities", actividadSeleccionada.titulo);
        await setDoc(docRef, actividadSeleccionada);
      } else {
        const docRef = doc(db, "Activities", actividadSeleccionada.titulo);
        await updateDoc(docRef, {...actividadSeleccionada});
      }

      await refreshData();

      toast.success(modoEdicion === "crear" ? "Actividad creada" : "Actividad actualizada", {
        description: `La actividad ha sido ${modoEdicion === "crear" ? "creada" : "actualizada"} correctamente.`,
      })

      setGuardando(false)
      setModoEdicion("lista")
      setActividadSeleccionada(null)
    }

    saveOrUpdateActivity()
  }

  const cancelarEdicion = () => {
    setModoEdicion("lista")
    setActividadSeleccionada(null)
  }

  const getNombreEquipo = (colorCode: string) => {
    const equipo = equipos.find((e) => e.colorCode === colorCode)
    return equipo ? equipo.nombre : "Seleccionar equipo"
  }

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
        return "#2c3e50"
      case "green":
        return "#27ae60"
      case "purple":
        return "#8e44ad"
      case "gray":
        return "#95a5a6"
      default:
        return "#777777"
    }
  }

  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC" // o "America/Mexico_City", etc.

    })
  }

  // Renderizar lista de actividades
  const renderListaActividades = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Actividades programadas</h3>
        <Button onClick={crearNuevaActividad} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Nueva actividad
        </Button>
      </div>

      {loading2 ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {actividadesAgrupadas.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No hay actividades programadas.</p>
          ) : (
            <Tabs value={fechaSeleccionada} onValueChange={setFechaSeleccionada}>
              <TabsList className="grid grid-flow-col auto-cols-fr h-auto mb-4 bg-zinc-800 p-1 rounded-md overflow-x-auto">
                {actividadesAgrupadas.map((grupo) => (
                  <TabsTrigger
                    key={grupo.fecha}
                    value={grupo.fecha}
                    className="text-xs py-2 data-[state=active]:bg-zinc-700"
                  >
                    {new Date(grupo.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" })}
                  </TabsTrigger>
                ))}
              </TabsList>

              {actividadesAgrupadas.map((grupo) => (
                <TabsContent key={grupo.fecha} value={grupo.fecha} className="mt-0" style={{backgroundColor: 'transparent'}}>
                  <div className="mb-3">
                    <h2 className="text-lg font-bold text-blue-400">{formatearFecha(grupo.fecha)}</h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-3">
                    {grupo.actividades.map((actividad) => (
                      <AccordionItem
                        key={actividad.id}
                        value={actividad.id}
                        className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:bg-zinc-700 hover:no-underline">
                          <div className="flex flex-col items-start text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{actividad.titulo}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  actividad.tipo === "competencia"
                                    ? "bg-blue-600"
                                    : actividad.tipo === "evento"
                                      ? "bg-purple-600"
                                      : "bg-green-600"
                                }`}
                              >
                                {actividad.tipo.charAt(0).toUpperCase() + actividad.tipo.slice(1)}
                              </span>
                              {actividad.tipo === "competencia" && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    actividad.tipoCompetencia === "enfrentamiento" ? "bg-amber-600" : "bg-teal-600"
                                  }`}
                                >
                                  {actividad.tipoCompetencia === "enfrentamiento" ? "1vs1" : "Grupal"}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 mt-1">
                              {actividad.hora} - {actividad.lugar}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3 border-t border-zinc-700">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1 text-zinc-300">
                                <Clock size={14} />
                                <span>{actividad.hora}</span>
                              </div>
                              <div className="flex items-center gap-1 text-zinc-300 col-span-2">
                                <MapPin size={14} />
                                <span>{actividad.lugar}</span>
                              </div>
                            </div>

                            {actividad.tipo === "competencia" && (
                              <div className="mt-3">
                                {actividad.tipoCompetencia === "enfrentamiento" &&
                                  actividad.enfrentamientos.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-zinc-300 mb-2">Enfrentamientos:</h4>
                                      <div className="space-y-2">
                                        {actividad.enfrentamientos.map((enfrentamiento) => (
                                          <div
                                            key={enfrentamiento.id}
                                            className="flex items-center justify-between text-sm bg-zinc-700 p-2 rounded"
                                          >
                                            <div className="flex items-center gap-1 w-[45%]">
                                            <div
                                              className="w-2 h-10 rounded-l-md"
                                              style={{ backgroundColor: getColorEquipo(enfrentamiento.equipoA) }}
                                            ></div>
                                              <span className="truncate">{getNombreEquipo(enfrentamiento.equipoA)}</span>
                                            </div>
                                            <span className="text-zinc-400 w-[5%]">vs</span>
                                            <div className="flex items-center justify-end gap-1 w-[45%]">
                                              <span className="truncate">{getNombreEquipo(enfrentamiento.equipoB)}</span>
                                              <div
                                                className="w-2 h-10 rounded-r-md"
                                                style={{ backgroundColor: getColorEquipo(enfrentamiento.equipoB) }}
                                              ></div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                {actividad.tipoCompetencia === "grupal" && actividad.grupos.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Grupos de equipos:</h4>
                                    <div className="space-y-3">
                                      {actividad.grupos.map((grupo, index) => (
                                        <div key={grupo.id} className="bg-zinc-700 p-2 rounded">
                                          <h5 className="text-xs font-medium text-zinc-300 mb-2">Grupo {index + 1}</h5>
                                          <div className="flex flex-wrap gap-2">
                                            {grupo.equipos.map((equipoCode) => (
                                              <div
                                                key={equipoCode}
                                                className="flex items-center gap-1 bg-zinc-600 px-2 py-1 rounded text-xs"
                                              >
                                                <div
                                                  className="w-2 h-2 rounded-full"
                                                  style={{ backgroundColor: getColorEquipo(equipoCode) }}
                                                ></div>
                                                <span>{getNombreEquipo(equipoCode)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex justify-end gap-2 mt-3">
                              <Button
                                onClick={() => editarActividad(actividad)}
                                variant="outline"
                                size="sm"
                                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                              >
                                Editar
                              </Button>
                              <Button onClick={() => eliminarActividad(actividad.titulo)} variant="destructive" size="sm">
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      )}
    </div>
  )

  // Renderizar formulario de edición/creación
  const renderFormularioActividad = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">
          {modoEdicion === "crear" ? "Nueva actividad" : "Editar actividad"}
        </h3>
        <Button
          onClick={cancelarEdicion}
          variant="outline"
          size="sm"
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
        >
          Cancelar
        </Button>
      </div>

      {actividadSeleccionada && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Título *</label>
              <Input
                value={actividadSeleccionada.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-white"
                placeholder="Ej: Carrera de Relevos"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Tipo de actividad *</label>
              <Select
                value={actividadSeleccionada.tipo}
                onValueChange={(value) => handleInputChange("tipo", value as string)}
              >
                <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-700 border-zinc-600 text-white">
                  <SelectItem value="competencia" className="focus:bg-zinc-600 focus:text-white">
                    Competencia
                  </SelectItem>
                  <SelectItem value="evento" className="focus:bg-zinc-600 focus:text-white">
                    Evento
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {actividadSeleccionada.tipo === "competencia" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Tipo de competencia *</label>
                <Select
                  value={actividadSeleccionada.tipoCompetencia || "enfrentamiento"}
                  onValueChange={(value) => handleInputChange("tipoCompetencia", value as string)}
                >
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                    <SelectValue  placeholder="Selecciona una opción"/>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-700 border-zinc-600 text-white">
                    <SelectItem value="enfrentamiento" className="focus:bg-zinc-600 focus:text-white">
                      Enfrentamiento directo (1 vs 1)
                    </SelectItem>
                    <SelectItem value="grupal" className="focus:bg-zinc-600 focus:text-white">
                      Competencia grupal
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Fecha *</label>
              <Input
                type="date"
                value={actividadSeleccionada.fecha}
                onChange={(e) => handleInputChange("fecha", e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Hora *</label>
              <Input
                value={actividadSeleccionada.hora}
                onChange={(e) => handleInputChange("hora", e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-white"
                placeholder="Ej: 10:00 AM"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-zinc-300">Lugar *</label>
              <Input
                value={actividadSeleccionada.lugar}
                onChange={(e) => handleInputChange("lugar", e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-white"
                placeholder="Ej: Campo Deportivo"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-zinc-300">Descripción</label>
              <Input
                value={actividadSeleccionada.descripcion || ""}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-white"
                placeholder="Descripción opcional"
              />
            </div>
          </div>

          {actividadSeleccionada.tipo === "competencia" &&
            actividadSeleccionada.tipoCompetencia === "enfrentamiento" && (
              <div className="space-y-3 pt-2 border-t border-zinc-700">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-zinc-300">Enfrentamientos</h4>
                  <Button
                    onClick={agregarEnfrentamiento}
                    variant="outline"
                    size="sm"
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Agregar
                  </Button>
                </div>

                {actividadSeleccionada.enfrentamientos.length === 0 ? (
                  <p className="text-zinc-400 text-sm text-center py-2">
                    No hay enfrentamientos. Agrega uno para comenzar.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {actividadSeleccionada.enfrentamientos.map((enfrentamiento) => (
                      <div
                        key={enfrentamiento.id}
                        className="grid grid-cols-9 gap-2 items-center bg-zinc-700 p-2 rounded"
                      >
                        <div className="col-span-4">
                          <Select
                            value={enfrentamiento.equipoA}
                            onValueChange={(value) => actualizarEnfrentamiento(enfrentamiento.id, "equipoA", value)}
                          >
                            <SelectTrigger className="bg-zinc-600 border-zinc-500 text-white h-8 text-xs w-full">
                              <SelectValue placeholder="Equipo A" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-700 border-zinc-600 text-white">
                              {equipos.map((equipo) => (
                                <SelectItem
                                  key={equipo.id}
                                  value={equipo.colorCode}
                                  className="focus:bg-zinc-600 focus:text-white"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: getColorEquipo(equipo.colorCode) }}
                                    ></div>
                                    <span>{equipo.nombre}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-1 text-center text-zinc-400 text-sm">vs</div>

                        <div className="col-span-4">
                          <Select
                            value={enfrentamiento.equipoB}
                            onValueChange={(value) => actualizarEnfrentamiento(enfrentamiento.id, "equipoB", value)}
                          >
                            <SelectTrigger className="bg-zinc-600 border-zinc-500 text-white h-8 text-xs w-full">
                              <SelectValue placeholder="Equipo B" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-700 border-zinc-600 text-white">
                              {equipos.map((equipo) => (
                                <SelectItem
                                  key={equipo.id}
                                  value={equipo.colorCode}
                                  className="focus:bg-zinc-600 focus:text-white"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: getColorEquipo(equipo.colorCode) }}
                                    ></div>
                                    <span>{equipo.nombre}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-9 flex justify-end">
                          <Button
                            onClick={() => eliminarEnfrentamiento(enfrentamiento.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-zinc-400 hover:text-red-500 hover:bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          {actividadSeleccionada.tipo === "competencia" && actividadSeleccionada.tipoCompetencia === "grupal" && (
            <div className="space-y-3 pt-2 border-t border-zinc-700">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-zinc-300">Grupos de equipos</h4>
                <Button
                  onClick={agregarGrupo}
                  variant="outline"
                  size="sm"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Agregar grupo
                </Button>
              </div>

              {actividadSeleccionada.grupos.length === 0 ? (
                <p className="text-zinc-400 text-sm text-center py-2">No hay grupos. Agrega uno para comenzar.</p>
              ) : (
                <div className="space-y-4">
                  {actividadSeleccionada.grupos.map((grupo, index) => (
                    <div key={grupo.id} className="bg-zinc-700 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-sm font-medium text-zinc-300">Grupo {index + 1}</h5>
                        <Button
                          onClick={() => eliminarGrupo(grupo.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-zinc-400 hover:text-red-500 hover:bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {grupo.equipos.map((equipoCode) => (
                          <div
                            key={equipoCode}
                            className="flex items-center gap-1 bg-zinc-600 px-2 py-1 rounded text-xs"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getColorEquipo(equipoCode) }}
                            ></div>
                            <span>{getNombreEquipo(equipoCode)}</span>
                            <Button
                              onClick={() => eliminarEquipoDeGrupo(grupo.id, equipoCode)}
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 text-zinc-400 hover:text-red-500 hover:bg-transparent"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2">
                        <Select onValueChange={(value) => agregarEquipoAGrupo(grupo.id, value)}>
                          <SelectTrigger className="bg-zinc-600 border-zinc-500 text-white h-8 text-xs">
                            <SelectValue placeholder="Agregar equipo" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-700 border-zinc-600 text-white">
                            {equipos
                              .filter((equipo) => !grupo.equipos.includes(equipo.colorCode))
                              .map((equipo) => (
                                <SelectItem
                                  key={equipo.id}
                                  value={equipo.colorCode}
                                  className="focus:bg-zinc-600 focus:text-white"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: getColorEquipo(equipo.colorCode) }}
                                    ></div>
                                    <span>{equipo.nombre}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-zinc-700">
            <Button
              onClick={guardarActividad}
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
                  Guardar actividad
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <Card className="border-zinc-700 bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Gestión del Calendario</CardTitle>
        </CardHeader>
        <CardContent>{modoEdicion === "lista" ? renderListaActividades() : renderFormularioActividad()}</CardContent>
      </Card>
    </div>
  )
}
