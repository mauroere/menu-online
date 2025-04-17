# Menu Online

Aplicación web para gestión de menús y pedidos en línea.

## Características

- 🍽️ Catálogo de productos
- 🛒 Carrito de compras
- 👤 Autenticación de usuarios
- 👨‍💼 Panel de administración
- 🏪 Panel de vendedores
- 📱 Diseño responsive
- 🌐 Despliegue en Railway

## Requisitos

- Node.js 18+
- PostgreSQL
- npm o yarn

## Configuración Local

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/menu-online.git
cd menu-online
```

2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo de variables de entorno:
```bash
cp .env.example .env.local
```

4. Configura las variables de entorno en `.env.local`

5. Inicia la base de datos:
```bash
npx prisma db push
```

6. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Despliegue en Railway

1. Crea una cuenta en [Railway](https://railway.app)

2. Instala Railway CLI:
```bash
npm i -g @railway/cli
```

3. Inicia sesión en Railway:
```bash
railway login
```

4. Vincula tu proyecto:
```bash
railway link
```

5. Configura las variables de entorno en Railway:
```bash
# Genera un secreto seguro para NEXTAUTH_SECRET
npm run generate-secret

# Configura las variables de entorno en Railway
railway variables set NEXTAUTH_URL=https://tu-app.railway.app
railway variables set NEXTAUTH_SECRET=tu-secreto-generado
railway variables set DATABASE_URL=tu-url-de-postgres
railway variables set DIRECT_URL=tu-url-directa-de-postgres
railway variables set NODE_ENV=production
```

6. Despliega la aplicación:
```bash
railway up
```

### Solución de problemas en Railway

Si encuentras errores relacionados con variables de entorno:

1. Verifica que todas las variables requeridas estén configuradas:
```bash
npm run railway:check
```

2. Asegúrate de que la variable `NEXTAUTH_SECRET` esté configurada correctamente:
```bash
railway variables get NEXTAUTH_SECRET
```

3. Si necesitas regenerar el secreto:
```bash
npm run generate-secret
railway variables set NEXTAUTH_SECRET=nuevo-secreto-generado
```

4. Reinicia el despliegue:
```bash
railway up
```

## Estructura del Proyecto

```
src/
├── app/                 # Rutas y páginas
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI
│   ├── admin/          # Componentes del panel admin
│   └── seller/         # Componentes del panel vendedor
├── lib/                # Utilidades y configuraciones
└── prisma/             # Schema y migraciones
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm start`: Inicia la aplicación en producción
- `npm run lint`: Ejecuta el linter
- `npm run format`: Formatea el código
- `npm run type-check`: Verifica los tipos de TypeScript
- `npm run railway:check`: Verifica las variables de entorno para Railway
- `npm run generate-secret`: Genera un secreto seguro para NEXTAUTH_SECRET

## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 