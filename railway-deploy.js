const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  console.error('Error: No se encontró package.json en el directorio actual');
  process.exit(1);
}

// Ejecutar el script de verificación de variables de entorno
console.log('Verificando variables de entorno...');
require('./railway-check.js');

try {
  // Ejecutar migraciones de Prisma
  console.log('Ejecutando migraciones de Prisma...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Generar cliente de Prisma
  console.log('Generando cliente de Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Construir la aplicación
  console.log('Construyendo la aplicación...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Despliegue completado exitosamente!');
} catch (error) {
  console.error('Error durante el despliegue:', error.message);
  process.exit(1);
} 