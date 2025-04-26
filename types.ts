// types.ts
export interface Team {
    id: string;
    name: string;
    score: number;
    trend: string;
  }

export interface TeamExtended {
    id: string;
    name: string;
    score: number;
    trend: string;
    logo: string;
    color: string;
  }

// Tipo para los enfrentamientos
export interface Enfrentamiento {
  id: string
  equipoA: string
  equipoB: string
}

// Tipo para los grupos de equipos
export interface  GrupoEquipos {
  id: string
  equipos: string[] // Array de colorCodes de equipos
}

// Tipo para las actividades
export interface  Actividad {
  id: string
  titulo: string
  fecha: string
  hora: string
  lugar: string
  tipo: "competencia" | "evento" | "entrenamiento"
  tipoCompetencia?: "enfrentamiento" | "grupal" // Nuevo campo para diferenciar tipos de competencia
  descripcion?: string
  enfrentamientos: Enfrentamiento[] // Para competencias tipo "enfrentamiento"
  grupos: GrupoEquipos[] // Para competencias tipo "grupal"
}

export interface Posicion {
  equipo: string[],
  puntos: number
}
// Tipo para los juegos (Con calificaciones)
export interface  Games {
  id: string
  calificacion: Posicion[],
  jugado: boolean
}