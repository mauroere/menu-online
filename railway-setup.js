const { execSync } = require('child_process');

// Configurar las variables de entorno en Railway
console.log('Configurando variables de entorno en Railway...');

try {
  // NEXTAUTH_SECRET
  execSync('railway variables set NEXTAUTH_SECRET=X7K9vM2N4P6Q8R0T2U4W6Y8Z0a2c4e6g8i0k2m4o6q8s0u2w4y6', { stdio: 'inherit' });
  console.log('✅ NEXTAUTH_SECRET configurado');

  // JWT_SECRET
  execSync('railway variables set JWT_SECRET=b3d5f7h9j1l3n5p7r9t1v3x5z7B9D1F3H5J7L9N1P3R5T7V9X1', { stdio: 'inherit' });
  console.log('✅ JWT_SECRET configurado');

  // NEXTAUTH_URL
  const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'https://tu-app.railway.app';
  
  execSync(`railway variables set NEXTAUTH_URL=${railwayUrl}`, { stdio: 'inherit' });
  console.log(`✅ NEXTAUTH_URL configurado: ${railwayUrl}`);

  // NEXT_PUBLIC_APP_URL
  execSync(`railway variables set NEXT_PUBLIC_APP_URL=${railwayUrl}`, { stdio: 'inherit' });
  console.log(`✅ NEXT_PUBLIC_APP_URL configurado: ${railwayUrl}`);

  // NEXT_PUBLIC_API_URL
  execSync(`railway variables set NEXT_PUBLIC_API_URL=${railwayUrl}/api`, { stdio: 'inherit' });
  console.log(`✅ NEXT_PUBLIC_API_URL configurado: ${railwayUrl}/api`);

  // NODE_ENV
  execSync('railway variables set NODE_ENV=production', { stdio: 'inherit' });
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