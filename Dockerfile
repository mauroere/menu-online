# Usar una imagen base específica de Alpine con las dependencias necesarias
FROM node:18-alpine3.14 AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    openssl1.1-compat \
    openssl1.1-compat-dev \
    libc6-compat \
    python3 \
    make \
    g++

# Etapa de dependencias
FROM base AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./
COPY prisma ./prisma

# Instalar dependencias
RUN npm install --frozen-lockfile

# Etapa de build
FROM base AS builder
WORKDIR /app

# Copiar dependencias y archivos necesarios
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Configurar variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXTAUTH_SECRET=X7K9vM2N4P6Q8R0T2U4W6Y8Z0a2c4e6g8i0k2m4o6q8s0u2w4y6
ENV JWT_SECRET=b3d5f7h9j1l3n5p7r9t1v3x5z7B9D1F3H5J7L9N1P3R5T7V9X1
ENV NODE_ENV=production

# Generar Prisma Client y construir la aplicación
RUN npx prisma generate
RUN npm run build

# Etapa de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario y grupo no root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Crear directorio .next y copiar archivos de build
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Configurar usuario
USER nextjs

# Exponer puerto
EXPOSE 3000

# Configurar variables de entorno
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar la aplicación
CMD ["node", "server.js"] 