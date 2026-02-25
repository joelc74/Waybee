# Waybee
# Waybee – Proyecto Final DAM (PPP)

Waybee es una aplicación híbrida desarrollada como Proyecto Final de Ciclo Superior de Desarrollo de Aplicaciones Multiplataforma (DAM). La plataforma combina **movilidad bajo demanda (viajes)** y **servicios de envío** en una única app.

---

## 🏗️ Arquitectura General

Monorepo estructurado en dos bloques principales:

```
WAYBEE_APP/
 ├── backend/        → API REST (Node.js)
 ├── prisma/         → Esquema y migraciones BD
 └── frontend/
      └── waybee-frontend/ → App Ionic + Angular
```

---

## 🚀 Tecnologías Utilizadas

### Frontend

* Ionic
* Angular (NgModules)
* Leaflet (mapas)
* Leaflet Routing Machine
* Capacitor (Android)
* SCSS personalizado (identidad corporativa Waybee)

### Backend

* Node.js
* Express
* Prisma ORM
* MySQL
* JWT (autenticación)
* Multer (subida de imágenes de perfil)

### Infraestructura

* Ubuntu Server (VM)
* MySQL Server
* PM2 (gestión de procesos)
* Tailscale (acceso remoto)

---

## 🔐 Sistema de Roles

* **Usuario** → Solicita viajes o envíos
* **Conductor/Repartidor** → Acepta y gestiona servicios
* **Administrador** → Control operativo y supervisión

Control de acceso mediante JWT.

---

## 🧭 Funcionalidades Principales (MVP)

* Registro y login
* Solicitud de viaje (origen/destino + cálculo estimado)
* Solicitud de envío (recogida/entrega)
* Asignación de conductor
* Estados del servicio:

  * En camino
  * Recogido
  * En curso
  * Completado
* Tracking en mapa
* Historial de servicios
* Sistema de favoritos
* Subida de imagen de perfil

---

## 🗄️ Base de Datos

Motor: MySQL
ORM: Prisma

Entidades principales:

* Usuario
* Servicio
* Favoritos
* Roles

Configuración en:

```
backend/.env
prisma/schema.prisma
```

---

## ⚙️ Instalación y Configuración

### 1️⃣ Backend

```
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Variables necesarias (.env):

```
DATABASE_URL=
JWT_SECRET=
PORT=
```

---

### 2️⃣ Frontend

```
cd frontend/waybee-frontend
npm install
ionic serve
```

Para Android:

```
npx cap sync
npx cap open android
```

---

## 🔄 Flujo Básico de Funcionamiento

1. Usuario inicia sesión.
2. Introduce origen y destino.
3. Se calcula distancia y precio estimado.
4. Se crea un registro en tabla `servicio` (estado pendiente).
5. El conductor acepta.
6. Se actualizan estados en tiempo real.
7. El servicio finaliza y queda persistido en historial.

---

## 🎯 Estado del Proyecto

* Proyecto académico (no producción).
* Funcionalidad enfocada a MVP estable.
* Arquitectura preparada para ampliaciones futuras.

---

## 👨‍💻 Autores

Joel Eduardo Cordero Requena
Eduardo Estévez Lemes

---

"Siempre encuentra el camino a casa" 🐝

