const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  console.error('Error: No se encontró package.json en el directorio actual');
  process.exit(1);
}

// Verificar que el archivo .env.railway existe
if (!fs.existsSync(path.join(process.cwd(), '.env.railway'))) {
  console.error('Error: No se encontró el archivo .env.railway');
  process.exit(1);
}

// Leer el archivo .env.railway
const envFile = fs.readFileSync(path.join(process.cwd(), '.env.railway'), 'utf8');
const envVars = {};

// Parsear el archivo .env.railway
envFile.split('\n').forEach(line => {
  // Ignorar comentarios y líneas vacías
  if (line.startsWith('#') || !line.trim()) return;
  
  // Extraer nombre y valor de la variable
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const [, name, value] = match;
    envVars[name.trim()] = value.trim();
  }
});

// Configurar las variables en Railway
console.log('Configurando variables de entorno en Railway...');

Object.entries(envVars).forEach(([name, value]) => {
  // Ignorar variables vacías o comentadas
  if (!value || value.startsWith('#')) return;
  
  try {
    console.log(`Configurando ${name}...`);
    execSync(`railway variables set ${name}=${value}`, { stdio: 'inherit' });
    console.log(`✅ ${name} configurado correctamente`);
  } catch (error) {
    console.error(`❌ Error al configurar ${name}:`, error.message);
  }
});

console.log('\n✅ Variables de entorno configuradas correctamente');
console.log('\nAhora puedes desplegar tu aplicación con:');
console.log('railway up'); 