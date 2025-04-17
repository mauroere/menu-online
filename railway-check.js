// Script para verificar variables de entorno en Railway
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET'
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Faltan las siguientes variables de entorno:')
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`))
  process.exit(1)
}

console.log('✅ Todas las variables de entorno requeridas están configuradas')

function checkEnv() {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(envVar => {
      console.error(`   ${envVar}`)
    })
    
    console.error('\n⚠️ Railway Environment Variables Configuration:')
    console.error('1. Go to Railway dashboard')
    console.error('2. Select your project')
    console.error('3. Go to "Variables" tab')
    console.error('4. Add the following variables:')
    
    missing.forEach(envVar => {
      if (envVar === 'NEXTAUTH_SECRET') {
        console.error(`   - ${envVar}: Generate a secure value with "openssl rand -base64 32"`)
      } else if (envVar === 'NEXTAUTH_URL') {
        console.error(`   - ${envVar}: https://your-app.railway.app (replace with your actual URL)`)
      } else if (envVar === 'DATABASE_URL' || envVar === 'DIRECT_URL') {
        console.error(`   - ${envVar}: Railway should provide this automatically for PostgreSQL databases`)
      } else {
        console.error(`   - ${envVar}: [required value]`)
      }
    })
    
    console.error('\n5. Click "Save Changes"')
    console.error('6. Railway will automatically restart your application')
    
    // In development, continue with default values
    if (process.env.NODE_ENV !== 'production') {
      console.warn('\n⚠️ Continuing with default values in development mode...')
      return
    }
    
    // In production, show warning but don't stop the application
    console.warn('\n⚠️ WARNING: Application is running without required environment variables.')
    console.warn('Some features may not work correctly.')
    return
  }

  console.log('✅ All required environment variables are set.')
}

checkEnv() 