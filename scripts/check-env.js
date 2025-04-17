const fs = require('fs')
const path = require('path')

const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
  'DIRECT_URL',
]

function checkEnv() {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(envVar => {
      console.error(`   ${envVar}`)
    })
    
    // Verificar si existe el archivo .env
    const envPath = path.resolve(process.cwd(), '.env')
    const envExists = fs.existsSync(envPath)
    
    if (!envExists) {
      console.error('\n⚠️ No .env file found in the project root.')
      console.error('Creating a new .env file with default values...')
      
      // Crear un archivo .env con valores predeterminados
      const defaultEnvContent = `# Database URLs
DATABASE_URL="postgresql://neondb_owner:npg_FrjP1Es4ShOz@ep-square-pine-a42zb310-pooler.us-east-1.aws.neon.tech/menu?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://neondb_owner:npg_FrjP1Es4ShOz@ep-square-pine-a42zb310.us-east-1.aws.neon.tech/menu?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="c9a0b0b9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0"

# Environment
NODE_ENV="development"
`
      fs.writeFileSync(envPath, defaultEnvContent)
      console.error('✅ Created .env file with default values.')
    } else {
      console.error('\n⚠️ .env file exists but is missing required variables.')
      console.error('Please add the missing variables to your .env file.')
    }
    
    console.error('\nFor production deployment:')
    console.error('1. Set these variables in your hosting platform (e.g., Vercel, Netlify)')
    console.error('2. Make sure NEXTAUTH_URL points to your production domain')
    console.error('3. Generate a secure NEXTAUTH_SECRET using: openssl rand -base64 32')
    
    // En desarrollo, continuar con valores predeterminados
    if (process.env.NODE_ENV !== 'production') {
      console.warn('\n⚠️ Continuing with default values in development mode...')
      return
    }
    
    process.exit(1)
  }

  console.log('✅ All required environment variables are set.')
}

checkEnv() 