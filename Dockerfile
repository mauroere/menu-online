# Usar una imagen base de Debian específica
FROM node:18-bullseye-slim AS base

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    openssl \
    libssl1.1 \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

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
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

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

# Configurar healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Comando para iniciar la aplicación
CMD ["node", "server.js"] 