# Sistema de Menú Online 🛍️

Sistema completo de e-commerce para la gestión de pedidos online, con roles de cliente, vendedor y administrador.

## 📋 Índice

1. [Requisitos Previos](#1-requisitos-previos)
2. [Instalación](#2-instalación)
3. [Funcionalidades](#3-funcionalidades)
   - [Usuario Final](#31-usuario-final-cliente)
   - [Vendedor](#32-vendedor)
   - [Administrador](#33-administrador)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Mantenimiento](#5-mantenimiento)
6. [Soporte y Contacto](#6-soporte-y-contacto)

## 1. Requisitos Previos

### Software Necesario
- Node.js (versión 18 o superior)
- PostgreSQL (versión 14 o superior)
- npm o yarn
- Git

### Cuentas de Servicios
- [MercadoPago](https://www.mercadopago.com) - Para procesamiento de pagos
- [SendGrid](https://sendgrid.com) - Para envío de correos electrónicos
- [NextAuth](https://next-auth.js.org) - Para autenticación

### Requisitos de Sistema
- CPU: 2 núcleos o más
- RAM: 4GB o más
- Espacio en disco: 1GB mínimo
- Sistema operativo: Windows, Linux o macOS

## 2. Instalación

### 2.1 Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd menu-online
```

### 2.2 Instalar Dependencias
```bash
npm install
# o
yarn install
```

### 2.3 Configuración del Entorno

Crear archivo `.env` en la raíz del proyecto:
```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/menu_online"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu_secreto_aqui"

# MercadoPago
MERCADOPAGO_PUBLIC_KEY="tu_public_key"
MERCADOPAGO_ACCESS_TOKEN="tu_access_token"

# SendGrid
SENDGRID_API_KEY="tu_api_key"
EMAIL_FROM="noreply@tudominio.com"
```

### 2.4 Configuración de la Base de Datos
```bash
# Generar cliente Prisma
npx prisma generate

# Crear tablas en la base de datos
npx prisma db push

# (Opcional) Cargar datos de ejemplo
npx prisma db seed
```

### 2.5 Iniciar el Servidor
```bash
# Desarrollo
npm run dev
# o
yarn dev

# Producción
npm run build
npm start
# o
yarn build
yarn start
```

## 3. Funcionalidades

### 3.1 Usuario Final (Cliente)

#### Catálogo y Búsqueda
- **Exploración de Productos**
  - Navegación por categorías
  - Vista en grid y lista
  - Filtros avanzados
  - Ordenamiento por precio/popularidad

- **Búsqueda**
  - Búsqueda por texto
  - Filtros por:
    - Precio
    - Categoría
    - Disponibilidad
    - Valoraciones
  - Sugerencias de búsqueda

- **Vista de Producto**
  - Galería de imágenes
  - Descripción detallada
  - Especificaciones
  - Valoraciones y reseñas
  - Productos relacionados

#### Carrito de Compras
- **Gestión de Productos**
  - Agregar/eliminar productos
  - Modificar cantidades
  - Guardar para más tarde
  - Cálculo automático de totales

- **Cupones y Descuentos**
  - Aplicar cupones
  - Ver descuentos disponibles
  - Historial de cupones usados

- **Envío**
  - Selección de método
  - Cálculo de costos
  - Estimación de tiempo
  - Guardar direcciones favoritas

#### Proceso de Compra
- **Registro/Login**
  - Registro con email
  - Login social (Google, Facebook)
  - Recuperación de contraseña
  - Verificación de email

- **Checkout**
  - Formulario de envío
  - Selección de método de pago
  - Integración con MercadoPago
  - Resumen de pedido
  - Confirmación

- **Seguimiento**
  - Estado del pedido
  - Historial de estados
  - Notificaciones por email
  - Tracking de envío

#### Perfil de Usuario
- **Información Personal**
  - Datos de contacto
  - Direcciones guardadas
  - Métodos de pago
  - Preferencias

- **Historial**
  - Pedidos realizados
  - Productos favoritos
  - Cupones disponibles
  - Reseñas escritas

#### Sistema de Quejas
- **Gestión de Quejas**
  - Crear nueva queja
  - Adjuntar archivos
  - Seguimiento de estado
  - Historial de comunicación

- **Soporte**
  - Chat en vivo
  - Tickets de soporte
  - FAQ
  - Centro de ayuda

### 3.2 Vendedor

#### Gestión de Productos
- **Catálogo**
  - Crear/editar/eliminar productos
  - Gestión de variantes
  - Precios y descuentos
  - Control de stock

- **Categorías**
  - Crear categorías
  - Organizar jerarquía
  - Atributos personalizados
  - Reglas de visualización

- **Inventario**
  - Control de stock
  - Alertas de bajo stock
  - Historial de movimientos
  - Exportación de datos

#### Gestión de Pedidos
- **Panel de Pedidos**
  - Vista general
  - Filtros avanzados
  - Búsqueda rápida
  - Acciones en lote

- **Procesamiento**
  - Actualizar estado
  - Generar facturas
  - Notificar al cliente
  - Gestionar devoluciones

- **Envíos**
  - Generar guías
  - Tracking
  - Notificaciones
  - Historial de envíos

#### Reportes de Ventas
- **Análisis**
  - Ventas por período
  - Productos más vendidos
  - Tendencias
  - KPIs principales

- **Exportación**
  - Formatos: CSV, Excel, PDF
  - Personalización de reportes
  - Programación automática
  - Dashboards

#### Gestión de Horarios
- **Configuración**
  - Horarios de entrega
  - Días festivos
  - Capacidad por día
  - Zonas de entrega

- **Calendario**
  - Vista mensual/semanal
  - Bloqueo de fechas
  - Gestión de pedidos
  - Alertas de capacidad

### 3.3 Administrador

#### Panel de Control
- **Dashboard**
  - Métricas clave
  - Gráficos en tiempo real
  - Alertas del sistema
  - Actividad reciente

- **Monitoreo**
  - Estado del sistema
  - Rendimiento
  - Errores
  - Uso de recursos

#### Gestión de Usuarios
- **Administración**
  - Crear/editar/eliminar usuarios
  - Asignar roles
  - Gestionar permisos
  - Bloqueo/desbloqueo

- **Roles y Permisos**
  - Crear roles
  - Definir permisos
  - Asignar usuarios
  - Auditoría

#### Configuración del Sistema
- **General**
  - Configuración básica
  - Integraciones
  - Políticas
  - Personalización

- **Integraciones**
  - MercadoPago
  - SendGrid
  - Analytics
  - APIs externas

#### Reportes y Analytics
- **Reportes**
  - Ventas
  - Usuarios
  - Productos
  - Sistema

- **Analytics**
  - Comportamiento
  - Conversión
  - Retención
  - ROI

#### Gestión de Quejas
- **Panel**
  - Lista de quejas
  - Priorización
  - Asignación
  - Seguimiento

- **Métricas**
  - Tiempo de respuesta
  - Satisfacción
  - Resolución
  - Tendencias

#### Logs del Sistema
- **Registro**
  - Actividad
  - Errores
  - Seguridad
  - Rendimiento

- **Auditoría**
  - Historial de cambios
  - Acciones de usuarios
  - Seguridad
  - Cumplimiento

## 4. Estructura del Proyecto

```
menu-online/
├── src/
│   ├── app/                 # Páginas y rutas
│   │   ├── admin/          # Panel de administración
│   │   ├── seller/         # Panel de vendedor
│   │   ├── checkout/       # Proceso de pago
│   │   └── profile/        # Perfil de usuario
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # Componentes de UI
│   │   ├── admin/         # Componentes de admin
│   │   ├── seller/        # Componentes de vendedor
│   │   └── shared/        # Componentes compartidos
│   ├── hooks/             # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useOrders.ts
│   ├── lib/               # Utilidades y configuraciones
│   │   ├── prisma.ts
│   │   ├── mercadopago.ts
│   │   └── sendgrid.ts
│   ├── pages/             # API endpoints
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   ├── seller/
│   │   │   └── auth/
│   └── types/             # Definiciones de tipos
├── prisma/                # Esquema de base de datos
│   ├── schema.prisma
│   └── seed.ts
├── public/                # Archivos estáticos
│   ├── images/
│   └── icons/
├── .env.example          # Ejemplo de variables de entorno
├── package.json          # Dependencias y scripts
└── README.md            # Documentación
```

## 5. Mantenimiento

### 5.1 Actualizaciones
```bash
# Actualizar dependencias
npm update
# o
yarn upgrade

# Actualizar base de datos
npx prisma db push

# Actualizar tipos
npx prisma generate
```

### 5.2 Respaldo de Base de Datos
```bash
# Crear respaldo
pg_dump -U usuario -d menu_online > backup.sql

# Restaurar respaldo
psql -U usuario -d menu_online < backup.sql
```

### 5.3 Monitoreo
- Revisar logs del sistema
- Monitorear uso de recursos
- Verificar integraciones
- Actualizar certificados

### 5.4 Seguridad
- Actualizar dependencias
- Revisar permisos
- Auditar accesos
- Mantener backups

## 6. Soporte y Contacto

### 6.1 Canales de Soporte
- Email: soporte@tudominio.com
- Documentación: docs.tudominio.com
- GitHub Issues: [URL_DEL_REPOSITORIO]/issues
- Chat en vivo: [URL_DEL_CHAT]

### 6.2 Recursos
- [Documentación Técnica](docs.tudominio.com/tech)
- [Guías de Usuario](docs.tudominio.com/user)
- [API Reference](docs.tudominio.com/api)
- [FAQ](docs.tudominio.com/faq)

### 6.3 Contribución
- Fork del repositorio
- Crear rama feature
- Commit cambios
- Pull request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 