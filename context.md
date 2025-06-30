### 🏷 Proyecto: Travel go

### 📦 Estructura del Repositorio

Este proyecto está organizado como un **monorepo**, incluyendo tanto el **frontend** como el **backend** en un mismo repositorio.

.
├── frontend/               # Aplicación web (React + Tailwind)
├── backend/                # API REST (Node.js + Express + Prisma)
│   └── src/
│       ├── db/
│       ├── middlewares/
│       ├── routers/
│       ├── services/
│       ├── index.ts
│       └── types.ts
├── README.md
└── context.md

El frontend será desarrollado en paralelo con otra IA y adaptado a las necesidades funcionales del backend y la lógica de negocio.

---

### 📝 Objetivo del sistema

Crear un portal de venta de paquetes turísticos para incrementar la facturación digital a través de un canal propio. El sistema busca personalizar ofertas, reducir la dependencia de plataformas externas y permitir expansión regional/internacional.

---

### 🔐 Roles definidos

**Cliente**: compra y consulta.
**Agente de ventas**: gestiona productos, asistencia.
**Administrador**: control total (pedidos, usuarios, reportes).

---

### 🎯 Funcionalidades principales

#### Para clientes
Registro e inicio de sesión.
Exploración de paquetes turísticos.
Carrito con múltiples productos, cupones y descuentos.
Seguimiento de pedidos y panel con historial.

#### Para el personal interno
Alta, baja y modificación de paquetes.
Gestión de pedidos y usuarios.
Visualización de reportes financieros.

---

### 📦 Productos / Paquetes

**Tipos de componentes**: vuelos, hoteles, traslados, actividades, seguros, asistencia.
**Paquetes**: prearmados o personalizados.
**BD**: campos comunes (id, nombre, precio, proveedor, etc.) y específicos (según tipo).

---

### 🛒 Carrito y compras

Combina múltiples productos.
Ofertas automáticas, condiciones y promociones bancarias.
Métodos de pago: tarjetas, transferencias, MercadoPago, PayPal (futuro).
Carrito persistente para usuarios logueados.

---

### 🔔 Notificaciones automáticas

Confirmación de compra, cambios de estado, recordatorios de viaje y encuestas post-compra.
Alertas internas para el equipo.

---

### 🔌 Integraciones previstas

Email marketing (Mailchimp, Hubspot)
CRM para seguimiento de clientes
MercadoPago y otros gateways

---

### ⚙️ Stack tecnológico sugerido

**Frontend**: React + TailwindCSS (desarrollado por otra IA)
**Backend**: Node.js con Express (implementado)
**DB**: SQLite (implementado con Prisma)
**CI/CD + Infraestructura**: AWS sugerido, con enfoque en seguridad y monitoreo

---

### 🔒 Seguridad

Autenticación con JWT (jwtMiddleware.ts)
Middleware de protección de rutas
Encriptación de datos sensibles
Prevención XSS, CSRF, SQLi
Cumplimiento con GDPR