const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Generar un secret seguro
const secret = crypto.randomBytes(32).toString('base64')

console.log('🔑 Generated secure NEXTAUTH_SECRET:')
console.log(secret)

// Verificar si existe el archivo .env
const envPath = path.resolve(process.cwd(), '.env')
const envExists = fs.existsSync(envPath)

if (envExists) {
  // Leer el archivo .env
  let envContent = fs.readFileSync(envPath, 'utf8')
  
  // Verificar si NEXTAUTH_SECRET ya existe
  if (envContent.includes('NEXTAUTH_SECRET=')) {
    // Reemplazar el valor existente
    envContent = envContent.replace(
      /NEXTAUTH_SECRET="[^"]*"/,
      `NEXTAUTH_SECRET="${secret}"`
    )
  } else {
    // Agregar NEXTAUTH_SECRET al final del archivo
    envContent += `\n\n# NextAuth Secret (Generated)\nNEXTAUTH_SECRET="${secret}"`
  }
  
  // Guardar el archivo .env actualizado
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Updated .env file with the new secret.')
} else {
  // Crear un nuevo archivo .env
  const defaultEnvContent = `# Database URLs
DATABASE_URL="postgresql://neondb_owner:npg_FrjP1Es4ShOz@ep-square-pine-a42zb310-pooler.us-east-1.aws.neon.tech/menu?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://neondb_owner:npg_FrjP1Es4ShOz@ep-square-pine-a42zb310.us-east-1.aws.neon.tech/menu?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${secret}"

# Environment
NODE_ENV="development"
`
  fs.writeFileSync(envPath, defaultEnvContent)
  console.log('✅ Created .env file with the new secret.')
}

console.log('\n⚠️ IMPORTANT: Make sure to set this secret in your production environment!') 