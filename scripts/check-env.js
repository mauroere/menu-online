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
    console.error('\nPlease set these variables in your environment.')
    process.exit(1)
  }

  console.log('✅ All required environment variables are set.')
}

checkEnv() 