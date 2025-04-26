import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Semana Cultural Los Ángeles y San Josecito",
    short_name: "Semana Cultural 2025",
    description: "Página oficial de la Semana Cultural Los Ángeles y San Josecito 2025",
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
