const crypto = require('crypto');
const { execSync } = require('child_process');

// Genera un secreto seguro para NEXTAUTH_SECRET
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

// Verifica si estamos en Railway
const isRailway = () => {
  return process.env.RAILWAY_ENVIRONMENT === 'production';
};

// Configura las variables de entorno en Railway
const setupRailwayEnv = () => {
  try {
    // Genera un secreto seguro
    const secret = generateSecret();
    
    // Configura las variables de entorno en Railway
    console.log('Configurando variables de entorno en Railway...');
    
    // NEXTAUTH_SECRET
    execSync(`railway variables set NEXTAUTH_SECRET=${secret}`);
    console.log('✅ NEXTAUTH_SECRET configurado');
    
    // NEXTAUTH_URL
    const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : 'https://tu-app.railway.app';
    
    execSync(`railway variables set NEXTAUTH_URL=${railwayUrl}`);
    console.log(`✅ NEXTAUTH_URL configurado: ${railwayUrl}`);
    
    // NODE_ENV
    execSync('railway variables set NODE_ENV=production');
    console.log('✅ NODE_ENV configurado: production');
    
    console.log('\n🎉 Variables de entorno configuradas correctamente');
    console.log('\nAhora puedes desplegar tu aplicación con:');
    console.log('railway up');
    
  } catch (error) {
    console.error('❌ Error al configurar las variables de entorno:', error.message);
    console.error('\nAsegúrate de estar autenticado en Railway:');
    console.error('railway login');
    console.error('\nY de haber vinculado tu proyecto:');
    console.error('railway link');
  }
};

// Ejecuta el script
setupRailwayEnv(); 