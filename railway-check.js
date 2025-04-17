// Script para verificar variables de entorno en Railway
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
    
    console.error('\n⚠️ Railway Environment Variables Configuration:')
    console.error('1. Ve al dashboard de Railway')
    console.error('2. Selecciona tu proyecto')
    console.error('3. Ve a la pestaña "Variables"')
    console.error('4. Agrega las siguientes variables:')
    
    missing.forEach(envVar => {
      if (envVar === 'NEXTAUTH_SECRET') {
        console.error(`   - ${envVar}: Genera un valor seguro con "openssl rand -base64 32"`)
      } else if (envVar === 'NEXTAUTH_URL') {
        console.error(`   - ${envVar}: https://tu-app.railway.app (reemplaza con tu URL real)`)
      } else if (envVar === 'DATABASE_URL' || envVar === 'DIRECT_URL') {
        console.error(`   - ${envVar}: Railway debería proporcionar esto automáticamente para bases de datos PostgreSQL`)
      } else {
        console.error(`   - ${envVar}: [valor requerido]`)
      }
    })
    
    console.error('\n5. Haz clic en "Save Changes"')
    console.error('6. Railway reiniciará automáticamente tu aplicación')
    
    // En desarrollo, continuar con valores predeterminados
    if (process.env.NODE_ENV !== 'production') {
      console.warn('\n⚠️ Continuing with default values in development mode...')
      return
    }
    
    // En producción, mostrar advertencia pero no detener la aplicación
    console.warn('\n⚠️ WARNING: Application is running without required environment variables.')
    console.warn('Some features may not work correctly.')
    return
  }

  console.log('✅ All required environment variables are set.')
}

checkEnv() 