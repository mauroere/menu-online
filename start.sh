#!/bin/sh

# Esperar a que la base de datos esté lista
echo "Waiting for database..."
npx prisma db push --accept-data-loss

# Generar el cliente Prisma
echo "Generating Prisma client..."
npx prisma generate

# Verificar que el cliente Prisma se generó correctamente
if [ ! -d "node_modules/.prisma" ]; then
  echo "Error: Prisma client not generated correctly"
  exit 1
fi

# Iniciar la aplicación
echo "Starting application..."
node server.js 