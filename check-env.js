// Script simple para verificar variables de entorno
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
    
    console.error('\n⚠️ Please set these variables in your environment.')
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