#!/bin/sh

# Esperar a que la base de datos esté lista
echo "Waiting for database..."
npx prisma db push --accept-data-loss

# Generar el cliente Prisma
echo "Generating Prisma client..."
npx prisma generate

# Iniciar la aplicación
echo "Starting application..."
node server.js 