// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true, // Esto ayuda a aplicar los cambios rápido
})

module.exports = withPWA({
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'], // Reemplazá con el dominio real, ej. 'res.cloudinary.com'
  },
});