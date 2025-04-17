const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

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