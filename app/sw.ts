export default function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").then(
        (registration) => {
          console.log("Service Worker registrado con éxito:", registration.scope)
        },
        (err) => {
          console.log("Error al registrar el Service Worker:", err)
        },
      )
    })
  }
}
