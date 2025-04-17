const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Verificar variables de entorno críticas
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
  'DIRECT_URL',
]

const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:')
  missing.forEach(envVar => {
    console.error(`   ${envVar}`)
  })
  
  console.error('\n⚠️ Please set these variables in your environment.')
  console.error('\nFor production deployment:')
  console.error('1. Set these variables in your hosting platform (e.g., Vercel, Netlify)')
  console.error('2. Make sure NEXTAUTH_URL points to your production domain')
  console.error('3. Generate a secure NEXTAUTH_SECRET using: openssl rand -base64 32')
  
  // En desarrollo, continuar con valores predeterminados
  if (process.env.NODE_ENV !== 'production') {
    console.warn('\n⚠️ Continuing with default values in development mode...')
  } else {
    console.error('\n❌ Cannot start server in production without required environment variables.')
    process.exit(1)
  }
} else {
  console.log('✅ All required environment variables are set.')
}

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = process.env.PORT || 3000

console.log('Starting server with config:', {
  dev,
  hostname,
  port,
  nodeEnv: process.env.NODE_ENV
})

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})

app.prepare().then(() => {
  console.log('Next.js app prepared')
  
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      console.log('Handling request:', req.url)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
}) 