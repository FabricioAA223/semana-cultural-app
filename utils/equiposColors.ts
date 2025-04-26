// utils/equiposColors.ts
export const getColorByTeamName = (nombre: string): string => {
    const colores: Record<string, string> = {
      Red: "#c0392b",
      Green: "#27ae60",
      Yellow: "#f1c40f",
      Purple: "#8e44ad",
      Orange: "#d35400",
      Lightblue: "#3498db",
      White: "#ecf0f1",
      Black: "#2c3e50",
    }
  
    return colores[nombre] || "#999" // Color por defecto
  }
  