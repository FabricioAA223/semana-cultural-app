"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/context/DataContext"
import { getColorByTeamName } from "@/utils/equiposColors"

// Tipo para los datos de posiciones
type GamePositionsScore = {
  posicion: number
  puntos: number
  equipo: string[]
}

// Componente para mostrar el icono de medalla según la posición
const getMedalIcon = (position: number) => {
  if (position === 1) {
    return <span className="text-yellow-400 text-xl font-bold">🥇</span>
  } else if (position === 2) {
    return <span className="text-gray-300 text-xl font-bold">🥈</span>
  } else if (position === 3) {
    return <span className="text-amber-700 text-xl font-bold">🥉</span>
  }
  return null
}

export default function GamePositionsTable() {
  const [selectedGame, setSelectedGame] = useState<string>("")
  const [califications, setCalifications] = useState<GamePositionsScore[]>([])
  const [gamesNames, setGamesNames] = useState<string[]>([])
  const { teams, games } = useData();

  // Simular la carga de juegos desde Firebase
  useEffect(() => {
    const fetchGames = async () => {
      // Simulamos una llamada a Firebase
      const gamesList = games.filter((game) => game.jugado).map((game) => game.id)
      setGamesNames(gamesList)
    }

    fetchGames()
  }, [games])

  const getTeamName = (color: string) => {
    const equipo = teams.find((e) => e.id === color)
    return equipo ? equipo.name : "Equipo desconocido"
  }

  // Manejar el cambio de juego seleccionado
  const handleGameChange = (value: string) => {
    setSelectedGame(value)

    // Simulamos la obtención de resultados desde Firebase
    const gameData = games.find((game) => game.id === value)
    if (gameData) {
      const calif: GamePositionsScore[] = []
      let position = 1

      gameData.calificacion.forEach((cal) => {
        calif.push({
          posicion: position,
          puntos: cal.puntos,
          equipo: cal.equipo,
        })
        position += 1
      })

      setCalifications(calif)
    } else {
      setCalifications([])
    }
  }

  return (
    <div className="w-full mx-auto bg-zinc-900 text-white">
      <Card className="border-none bg-transparent rounded-none sm:rounded-lg sm:mx-auto sm:max-w-md">
        <CardHeader className="pb-2 px-6 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Puntaje por Actividad</CardTitle>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <Select value={selectedGame} onValueChange={handleGameChange}>
              <SelectTrigger className="w-full sm:w-[200px] bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Selecciona un juego" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {gamesNames.map((game) => (
                  <SelectItem key={game} value={game} className="focus:bg-zinc-700 focus:text-white">
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-6 sm:px-6">
          {selectedGame ? (
            <div className="rounded-lg overflow-hidden border border-zinc-600 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-800 text-zinc-300 text-xs sm:text-sm border-b border-zinc-600">
                      <th className="py-4 px-2 text-left" style={{ backgroundColor: "#2d2d2d", width: "10%" }}>
                        <div className="flex items-center">
                          <span className="mr-1">Pos</span>
                        </div>
                      </th>
                      <th className="py-4 px-2 text-left" style={{ backgroundColor: "#2d2d2d" }}>
                        <div className="flex items-center">
                          <span className="mr-1">Equipo</span>
                        </div>
                      </th>
                      <th className="py-4 px-2 text-right" style={{ backgroundColor: "#2d2d2d", width: "20%" }}>
                        <div className="flex items-center justify-end">
                          <span className="mr-1">Pts</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {califications.map((item) => (
                      <React.Fragment key={item.posicion}>
                        <tr
                          key={`${item.posicion}`}
                          className="border-t border-zinc-600 hover:bg-zinc-800 transition-colors"
                        >
                          <td className="py-3 px-2 font-bold text-sm text-center">
                            {item.posicion <= 3 ?
                              <div className="flex items-center justify-center">{getMedalIcon(item.posicion)}</div>
                              :
                              item.posicion
                            }
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-column" style={{ flexDirection: 'column', gap: '6px' }}>
                              {item.equipo.map((team, teamIndex) => (
                                <div
                                  key={teamIndex}
                                  className="relative font-medium text-sm sm:text-base truncate max-w-[230px] sm:max-w-[200px]"
                                  style={{
                                    backgroundImage: `url(/placeholder.svg?height=30&width=30)`,
                                    backgroundSize: "20px 20px",
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "left center",
                                    paddingLeft: "28px",
                                    backgroundColor: `${getColorByTeamName(team)}45`,
                                    borderRadius: "4px",
                                    padding: "6px 20px",
                                  }}
                                >
                                  {getTeamName(team)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-sm">
                            {item.puntos}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-400 border border-zinc-700 rounded-lg mt-4 bg-zinc-800/30">
              Selecciona un juego para ver los resultados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
