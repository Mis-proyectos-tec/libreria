# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ReadFlow** — digital library web app, Proyecto Diseño de Software TEC 2026. Fase I built the frontend; Fase II adds a distributed microservices backend.

| Component | Path | Tech | Estado |
|---|---|---|---|
| Frontend | `src/` | React 19, Vite, React Router v7 | Completo |
| MS-1 Backend | `api-functions/` | Azure Functions + Node.js + SQL Server | Completo |
| MS-2 Backend | `microservicios/ms2-nodejs/` | Node.js, Express, Mongoose | Completo y desplegado |
| MS-3 Backend | `microservicios/ms3-python/` *(pendiente)* | Python + FastAPI (Notifications) | Pendiente |

---

## Estado Actual del Proyecto (2026-06-03)

### Completado

- [x] Frontend React completo con todas las páginas y rutas
- [x] Rediseño estético: paleta pastel lavender/rosa/menta, DM Sans + DM Serif Display, glassmorphism, dark mode
- [x] Firebase Auth integrado (login, registro, perfil)
- [x] MS-2 Node.js + Express desplegado en Azure App Service (`readflow-ms2`)
- [x] Cosmos DB for MongoDB — colecciones: `users`, `readingprogresses`, `favorites`
- [x] 4 usuarios sembrados en Cosmos DB (Victor, Ian, Ismael, Mariano)
- [x] Reading Progress migrado de localStorage → MS-2 API
- [x] Favorites migrado de localStorage → MS-2 API
- [x] APIM configurado con los 14 endpoints de MS-2 usando `set-backend-service`
- [x] GitHub Actions CI/CD para MS-2 (`deploy-ms2.yml`) — se dispara en push a `microservicios/ms2-nodejs/**`
- [x] Compound unique indexes en `ReadingProgress` y `Favorite` (previene duplicados)
- [x] Código limpio: eliminado código muerto (authService, peticiones_Azure), refactorizado booksService
- [x] MS-1 Azure Functions — Books CRUD + file/cover URLs + file upload (Azure Storage Blob)

### Pendiente

- [ ] **MS-3 Python FastAPI** — Notificaciones con Azure Service Bus + WebSocket
- [ ] Colección Postman — 19 endpoints, mínimo 1 test por endpoint (entregable)
- [ ] GitHub Actions para MS-3
- [ ] Conectar MS-1 endpoints a APIM (cambiar mock → `set-backend-service`)
- [ ] Documentación Swagger / OpenAPI
- [ ] Video demostrativo — máx 5 min, arquitectura + flujos de negocio

---

## Próximos Pasos (orden recomendado)

### 1. MS-1 — Integración con APIM
- Configurar endpoints `/books`, `/books/{id}` en APIM para apuntar a Azure Functions
- Cambiar policies de mock → `set-backend-service` a `func-milibreria-api`
- Validar que GET/POST books funciona desde frontend

### 2. MS-3 — Python FastAPI (Notifications)
- Crear proyecto FastAPI en `microservicios/ms3-python/`
- Conectar a Azure Service Bus (receptor de mensajes)
- WebSocket para notificaciones en tiempo real al frontend
- MS-1 o MS-2 deben publicar eventos al Service Bus (ej. libro agregado)
- Crear Azure App Service para MS-3
- Configurar GitHub Actions `deploy-ms3.yml`

### 3. Postman Collection
- Crear colección con los 19 endpoints (5 MS-1 + 14 MS-2)
- Al menos 1 test automatizado por endpoint (status code, schema, etc.)
- Exportar como JSON para entrega

### 4. Documentación Final
- Swagger/OpenAPI para MS-1 y MS-2
- Video máx 5 min: mostrar arquitectura APIM → microservicios, flujos de login, favoritos, lectura, notificaciones

---

## Frontend — `src/`

### Commands

```bash
npm run dev       # dev server (Vite, port 5173)
npm run build     # production build
npm run lint      # ESLint flat config
npm run preview   # preview production build
```

### Environment Variables (`.env`)

```
VITE_API_BASE_URL=https://librosapi.azure-api.net/v1
VITE_API_SUBSCRIPTION_KEY=<key>

# Firebase configuration (use # for comments, not //)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Vite must be restarted after `.env` changes.

### Authentication — Firebase Auth

Auth is handled by Firebase, NOT the Azure API. Flow:

1. `signInWithEmailAndPassword` → Firebase verifies credentials
2. `onAuthStateChanged` fires → fetches all users from Azure API
3. Matches by `firebaseUid` → sets `currentUser` with merged data
4. `currentUser` = `{ ...azureApiUser, uid: firebaseUser.uid }`

**Critical:** Azure API `GET /users` must return `firebaseUid` on every user object — without it login always fails.

Auth functions exposed from `AuthContext` (`src/context/authContext.jsx`):

| Function | What it touches |
|---|---|
| `login(email, password)` | Firebase only |
| `register(name, username, email, password)` | Firebase + Azure API POST /users |
| `logout()` | Firebase only |
| `updateProfileName(name)` | Azure API only (also updates `initials`) |
| `updateProfileUsername(username)` | Azure API only |
| `updateProfileEmail(currentPassword, newEmail)` | Firebase + Azure API |
| `updateProfilePassword(currentPassword, newPassword)` | Firebase only |

Reauthentication with `EmailAuthProvider.credential` is required before updating email or password.

### Context Layer

Two providers wrap the app (`src/main.jsx`):

- **`AuthProvider`** — Firebase session + Azure user profile. Renders `{!loadingAuth && children}` so nothing renders until Firebase resolves the session (prevents white screen on reload).
- **`AppDataProvider`** — bulk-fetches books, categories, reading-progress, favorites on mount via `Promise.all`. Exposes `reloadAppData()` for post-mutation refresh.

### Service Layer

- `src/services/booksService.js` — API calls for books, categories, reading-progress, favorites, users. Single `apiRequest()` helper prepends `VITE_API_BASE_URL` and attaches the subscription key.
- `src/services/usersService.js` — CRUD for users (used by `authContext.jsx`). Only user service in the app.
- `src/firebase.js` — initializes Firebase app and exports `auth`.

### Routing (`src/App.jsx`)

Routes guarded inline with `isAuthenticated`. `/registro` is public.

| Path | Page |
|---|---|
| `/login` | `loginPage.jsx` |
| `/registro` | `registroPage.jsx` |
| `/home` | `homePage.jsx` |
| `/biblioteca` | `bibliotecaPage.jsx` |
| `/favoritos` | `favoritosPage.jsx` |
| `/perfil` | `perfilPage.jsx` |
| `/detalle-libro` | `detalleLibroPage.jsx` — receives `libroId` via `location.state` |
| `/lectura` | `lecturaPage.jsx` — receives `libroId` via `location.state` |
| `/admin-libros` | `adminLibrosPage.jsx` |
| `/nuevo-libro` | `formLibroPage.jsx` |
| `/editar-libro` | `formLibroPage.jsx` (edit mode, receives `libroId` via `location.state`) |

Navigation between detail views uses `navigate("/route", { state: { libroId } })` — no URL params.

### Reading Progress and Favorites

Fully migrated to MS-2 API (no longer uses localStorage):
- `lecturaPage.jsx` — calls `createReadingProgress` / `updateReadingProgress`, then `reloadAppData()`
- `detalleLibroPage.jsx` — calls `createFavorite` / `deleteFavorite`, then `reloadAppData()`
- `favoritosPage.jsx` — reads from `AppDataProvider.favorites`, calls `deleteFavorite`
- `miBibliotecaPage.jsx` — reads from `AppDataProvider.favorites` filtered by `currentUser.id`

### Azure API — User Object Schema

```json
{
  "id": "68343c8f...",
  "username": "victorm",
  "name": "Victor",
  "email": "victor@web.com",
  "password": "",
  "initials": "V",
  "firebaseUid": "ax5AwJS7JYVty06xdftJezD83B42"
}
```

`password` is always empty — Firebase handles authentication.
`id` is a Cosmos DB ObjectId string (not a numeric mock ID).

---

## MS-1 — `api-functions/`

Azure Functions (Node.js) for Books CRUD, file/cover URLs, and file uploads. Uses SQL Server backend.

### Azure Function App

- **Nombre:** `func-milibreria-api`
- **Runtime:** Node.js 20
- **Database:** Azure SQL Server (mssql)
- **Storage:** Azure Blob Storage (covers + PDFs)

### Commands

```bash
cd api-functions
npm start          # local development server
npm run test       # run tests (no tests yet)
```

### Environment Variables (local.settings.json)

```json
{
  "SQL_CONNECTION_STRING": "Server=...",
  "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;..."
}
```

### Structure

```
api-functions/
├── host.json                     # Azure Functions runtime config
├── package.json
└── src/functions/
    ├── books.js                  # GET/POST /api/books (Books CRUD)
    ├── bookFileUrl.js            # GET /api/books/{id}/file-url (PDF SAS)
    ├── bookCoverUrl.js           # GET /api/books/{id}/cover-url (Cover SAS)
    ├── generateUploadUrl.js       # POST /api/generate-upload-url (Blob SAS)
    └── health.js                 # GET /api/health (Health check)
```

### Endpoints — 5 operations

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/books` | Returns all books |
| POST | `/api/books` | Create book (requires `pdf_blob_name`) |
| GET | `/api/books/{id}/file-url` | SAS URL for PDF (expires in 1 hour) |
| GET | `/api/books/{id}/cover-url` | SAS URL for cover image |
| POST | `/api/generate-upload-url` | Get SAS URL to upload file to Blob Storage |
| GET | `/api/health` | Health check |

### Database — Azure SQL Server

Table: `dbo.Books`

```sql
CREATE TABLE dbo.Books (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id NVARCHAR(100),
    title NVARCHAR(200) NOT NULL,
    author NVARCHAR(150),
    description NVARCHAR(MAX),
    category NVARCHAR(100),
    language NVARCHAR(20) DEFAULT 'es',
    current_status NVARCHAR(50) DEFAULT 'activo',
    is_public BIT DEFAULT 1,
    pdf_blob_name NVARCHAR(500) NOT NULL,
    cover_blob_name NVARCHAR(500),
    created_at DATETIME DEFAULT GETUTCDATE()
);
```

### CI/CD

**Status:** Not yet configured. Manual deployment via VS Code Azure Extensions or `func azure functionapp publish`.

---

## MS-2 — `microservicios/ms2-nodejs/`

Node.js + Express microservice for Users, Reading Progress and Favorites. Deployed to Azure App Service, exposed via APIM.

### Azure App Service

- **Nombre:** `readflow-ms2`
- **URL:** `readflow-ms2-hpdeavdkcad4cyfe.eastus2-01.azurewebsites.net`
- **Runtime:** Node 22 LTS, Linux
- **Health:** `GET /health` → `{ status: "OK", service: "MS2-NodeJS" }`

### Commands

```bash
cd microservicios/ms2-nodejs
npm run dev    # nodemon (development)
npm start      # node server.js (production)
```

### Environment Variables (`microservicios/ms2-nodejs/.env`)

```
PORT=3000
COSMOS_CONNECTION_STRING=mongodb://...
```

### Structure

```
ms2-nodejs/
├── app.js                        # Express + route registration
├── server.js                     # entry point, connects DB then starts server
└── src/
    ├── config/db.js              # Mongoose connection to Cosmos DB
    ├── models/
    │   ├── User.js               # username, name, email, password, initials, firebaseUid
    │   ├── ReadingProgress.js    # userId, bookId, currentPage, percentage, updatedAt
    │   └── Favorite.js           # userId, bookId — unique compound index (userId+bookId)
    ├── controllers/
    │   ├── userController.js
    │   ├── readingProgressController.js
    │   └── favoriteController.js
    └── routes/
        ├── userRoutes.js
        ├── readingProgressRoutes.js
        └── favoriteRoutes.js
```

### Endpoints — 14 operations

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/users` | Used by authContext on every login |
| GET | `/users/:id` | |
| POST | `/users` | Called on register — must save `firebaseUid` |
| PUT | `/users/:id` | Returns full updated object |
| DELETE | `/users/:id` | Returns `{ message, userId }` |
| GET | `/reading-progress` | |
| GET | `/reading-progress/:id` | |
| POST | `/reading-progress` | |
| PUT | `/reading-progress/:id` | Auto-updates `updatedAt` |
| DELETE | `/reading-progress/:id` | |
| GET | `/favorites` | |
| GET | `/favorites/:id` | |
| POST | `/favorites` | |
| DELETE | `/favorites/:id` | |

### Database — Azure Cosmos DB for MongoDB (RU-based, Serverless)

Database: `ms2db`. Collections: `users`, `readingprogresses`, `favorites`.

All models use `toJSON` transform: exposes `id` (string), removes `_id` and `__v`.
`ReadingProgress` and `Favorite` have unique compound indexes on `(userId, bookId)`.

`GET /users` must return `firebaseUid` — this is how `authContext` matches Firebase sessions to Azure profiles.

### CI/CD

GitHub Actions: `.github/workflows/deploy-ms2.yml`
- Trigger: push to `main` touching `microservicios/ms2-nodejs/**`, or manual `workflow_dispatch`
- Runs `npm ci --omit=dev` in CI, deploys folder via `azure/webapps-deploy@v2`
- Secret required: `AZURE_WEBAPP_PUBLISH_PROFILE_MS2`

---

## MS-3 — Python FastAPI (Notifications)

**Estado: Pendiente de implementar.**

Will handle real-time notifications via Azure Service Bus + WebSocket.

### Notification flow

Trigger event (e.g. book added) → MS-2 publishes to Azure Service Bus → MS-3:
1. Reads message from queue
2. Persists notification to DB
3. Emits real-time event via WebSocket to frontend
4. Sends push notification to mobile (optional)

---

## Microservices Architecture (Fase II)

```
Frontend (React)
      ↓
   APIM (single gateway — Ocp-Apim-Subscription-Key)
      ↓              ↓              ↓
MS-1 Functions  MS-2 Node.js   MS-3 Python FastAPI
Books CRUD      Users +        Notifications
File/Cover URLs ReadingProgress (Pendiente)
                Favorites
      ↓              ↓              ↓
  Azure SQL    Cosmos DB       Service Bus
  (Activo)     (Activo)        (Pendiente)
```

All microservices are exposed exclusively through APIM. Direct backend URLs are protected by digital certificates — only APIM can call them.

### APIM — Estado de endpoints

| Endpoint | Estado | Backend |
|---|---|---|
| `/books*` | Real — MS-1 | `func-milibreria-api` |
| `/users*` | Real — MS-2 | `readflow-ms2` |
| `/reading-progress*` | Real — MS-2 | `readflow-ms2` |
| `/favorites*` | Real — MS-2 | `readflow-ms2` |
