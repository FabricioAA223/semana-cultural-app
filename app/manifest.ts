import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Semana Cultural Los Ángeles y San Josecito",
    short_name: "Semana Cultural",
    description: "Tabla de clasificación de equipos",
    start_url: "/",
    display: "standalone",
    background_color: "#1e1e1e",
    theme_color: "#1e1e1e",
    icons: [
      {
        src: "/icons/logo-semana-cultural.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/logo-semana-cultural.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/logo-semana-cultural.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
