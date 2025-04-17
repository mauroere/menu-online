/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'res.cloudinary.com', // Si usas Cloudinary para imágenes
      'lh3.googleusercontent.com', // Para imágenes de Google OAuth
    ],
  },
  // Optimizaciones para Railway
  swcMinify: true,
  reactStrictMode: true,
  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 