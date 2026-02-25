# Waybee
# Waybee – Proyecto Final DAM (PPP)

Waybee es una aplicación híbrida desarrollada como Proyecto Final de Ciclo Superior de Desarrollo de Aplicaciones Multiplataforma (DAM). La plataforma combina **movilidad bajo demanda (viajes)** y **servicios de envío** en una única app.
(Hay una estimación de precios en los viajes que no se adapta a la realidad; simplemente son ejemplos de funcionalidad)

---

## 🏗️ Arquitectura General

Monorepo estructurado en dos bloques principales:

```
WAYBEE_APP/
 ├── backend/        → API REST (Node.js)
 ├── Sequelize       → ORM
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
* Sequelize ORM
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
  ** INSERT INTO usuario
(nombre, email, telefono, activo, password_hash, fecha_registro, rol, img_profile)
VALUES
('Gerardo Martín', 'gmartin@waybee.com', '657489376', 1,
'$2a$12$pB4b/D7O1ZSE8Hp1B1GTEeksvoB1xV4X5Bfv0oZhrkNL9Rg4sLm.S', NOW(), 'driver', NULL);
 ** INSERT INTO conductor
(id_usuario, disponible, rating_promedio, fecha_alta)
VALUES
(9, 1, 0.00, NOW());

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
ORM: Sequelize

Entidades principales:

* Usuario
* Conductor
* Pago
* Valoracion
* Vehiculo
* Servicio
* Favoritos
* Roles

Configuración en:

```
backend/.env
configuración mediante modelos Sequelize
```

---

## ⚙️ Instalación y Configuración

### 1️⃣ Backend

```
cd backend
npm install
npm install sequelize mysql2
npx sequelize-cli init
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
cd frontend/waybee/frontend
npm install
ionic serve
```

Para Android:

```
cd frontend/waybee/frontend
npm list @capacitor/core
npm install @capacitor/core @capacitor/cli
npx cap add android
ionic build
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

## 📝 NOTA: 
En un principio se planteó utilizar Prisma como ORM. Finalmente se desestimó esta opción y se optó por Sequelize, por ofrecer una integración más directa con la arquitectura ya construida y un control más explícito sobre los modelos y relaciones.

La mayor dificultad técnica del proyecto fue tomar la decisión de no implementar un sistema completo de migraciones y mantener el enfoque en un MVP funcional, priorizando estabilidad, claridad estructural y cumplimiento de los criterios académicos frente a sobreingeniería.

## 👨‍💻 Autores

Joel Eduardo Cordero Requena
Eduardo Estévez Lemes

---

"Siempre encuentra el camino a casa" 🐝

