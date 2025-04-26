// next-sitemap.js
module.exports = {
    siteUrl: 'https://semana-cultural.vercel.app', // Asegúrate de poner tu dominio aquí
    generateRobotsTxt: true, // Genera automáticamente el archivo robots.txt
    exclude: ['/admin', '/admin/login', '/admin/dashboard'], // Excluye rutas privadas
    sitemapSize: 5000, // Si tu sitio tiene muchas páginas
    changefreq: 'weekly', // Dependiendo de la frecuencia de cambios en tu sitio
    priority: 0.7, // Prioridad de las páginas
  }
  