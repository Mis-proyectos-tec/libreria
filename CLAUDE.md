# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ReadFlow** — digital library web app, Proyecto Diseño de Software TEC 2026. Fase I built the frontend; Fase II adds a distributed microservices backend.

| Component | Path | Tech | Estado |
|---|---|---|---|
| Frontend | `src/` | React 19, Vite, React Router v7 | Completo |
| MS-1 Backend | `api-functions/` | Azure Functions + Node.js + SQL Server | Completo y desplegado |
| MS-2 Backend | `microservicios/ms2-nodejs/` | Node.js, Express, Mongoose | Completo y desplegado |
| MS-3 Backend | `microservicios/api-notifications/` | Node.js, Express, SignalR, SQL Server | Completo y desplegado |

---

## Estado Actual del Proyecto (2026-06-06)

### Completado

- [x] Frontend React completo con todas las páginas y rutas
- [x] Rediseño estético: paleta pastel lavender/rosa/menta, DM Sans + DM Serif Display, glassmorphism, dark mode
- [x] Dark mode sidebar mejorado, filtros de categoría como dropdown, spinners inline por sección, componente CoverImage
- [x] Firebase Auth integrado (login, registro, perfil)
- [x] MS-2 Node.js + Express desplegado en Azure App Service (`readflow-ms2`)
- [x] Cosmos DB for MongoDB — colecciones: `users`, `readingprogresses`, `favorites`
- [x] Reading Progress y Favorites migrados de localStorage → MS-2 API
- [x] APIM configurado con todos los endpoints de MS-1, MS-2 y MS-3 usando `set-backend-service`
- [x] GitHub Actions CI/CD para MS-2 (`deploy-ms2.yml`) y MS-3 (`deploy-ms3.yml`)
- [x] Compound unique indexes en `ReadingProgress` y `Favorite`
- [x] MS-1 Azure Functions — Books CRUD + file/cover URLs + file upload (Azure Storage Blob)
- [x] **Certificados mTLS implementados y funcionando** — APIM presenta `apim-client-cert` a MS-1, MS-2 y MS-3; backends validan thumbprint
- [x] **MS-3 Node.js + Express desplegado en Azure App Service (`app-milibreria-notifications`)**
- [x] MS-3 — Notificaciones en tiempo real via Azure SignalR Service
- [x] MS-3 — Book likes con persistencia en Azure SQL Server (`dbo.BookLikes`, `dbo.Notifications`)
- [x] MS-3 — `certAuth.js` + `jwtAuth.js` middlewares (cert thumbprint + JWT Bearer)
- [x] **JWT auth flow** — Firebase idToken intercambiado por app JWT via `POST /auth/token` (MS-2); JWT almacenado en localStorage y usado en todos los requests a MS-2 y MS-3
- [x] **Per-page data loading** — eliminado AppDataProvider global; cada página carga solo los datos que necesita con hooks propios + AbortController
- [x] **Paginación** — componente `Pagination` en todas las grids de libros (5 por página)
- [x] **Navegación con `from` state** — botón "Volver" en detalleLibroPage y lecturaPage regresa a la página de origen
- [x] Dark mode eliminado de lecturaPage
- [x] Carga de usuarios eliminada del frontend (no se muestra "Subido por" en ninguna página)

### Pendiente

- [ ] Colección Postman — mínimo 1 test por endpoint (entregable)
- [ ] Documentación Swagger / OpenAPI
- [ ] Video demostrativo — máx 5 min, arquitectura + flujos de negocio

---

## Próximos Pasos (orden recomendado)

### 1. Postman Collection
- Crear colección con todos los endpoints (MS-1 + MS-2 + MS-3)
- Al menos 1 test automatizado por endpoint (status code, schema, etc.)
- Exportar como JSON para entrega
- Configurar certificado `apim-client-cert` en la colección Postman para autenticación

### 2. Documentación Final
- Swagger/OpenAPI para MS-1, MS-2 y MS-3
- Video máx 5 min: mostrar arquitectura APIM → microservicios, flujos de login, favoritos, lectura, notificaciones y likes

---

## Seguridad — Certificados mTLS (APIM → Backends)

Esta sección documenta la implementación completa de certificados. Está implementado en MS-1, MS-2 y MS-3.

### Arquitectura

```
Cliente (Frontend/Postman)
        ↓  Ocp-Apim-Subscription-Key + Authorization: Bearer <JWT>
      APIM
        ↓  presenta apim-client-cert (mTLS)
   MS-1 / MS-2 / MS-3
        validan thumbprint via X-ARR-ClientCert header
        MS-2 y MS-3 también validan JWT Bearer (excepto /health y /auth/token)
```

### Certificados en Azure Key Vault (`readflow-kv`)

| Certificado | Uso |
|---|---|
| `apim-client-cert` | APIM lo presenta al llamar a cualquier backend |
| `func-milibreria-api-server` | Cert de servidor de MS-1 |
| `readflow-ms2-server` | Cert de servidor de MS-2 |
| `readflow-ms3-server` | Cert de servidor de MS-3 |

### APIM — Policy de API (`books-api-v1` → All Operations)

**Importante:** La policy que aplica es la de nivel API, no la global. Cada operación tiene además su propia policy con `<base />` + `<set-backend-service backend-id="...">`.

```xml
<policies>
    <inbound>
        <choose>
            <when condition="@(context.Request.Url.Path.Contains("/notifications") || (context.Request.Url.Path.Contains("/books") && context.Request.Url.Path.Contains("/like")))">
                <set-backend-service backend-id="ms3-notifications" />
            </when>
            <when condition="@(context.Request.Url.Path.Contains("/books") || context.Request.Url.Path.Contains("/categories"))">
                <set-backend-service backend-id="ms1-functions" />
            </when>
            <otherwise>
                <set-backend-service backend-id="ms2-nodejs" />
            </otherwise>
        </choose>
        <cors allow-credentials="false">
            <allowed-origins>
                <origin>https://brave-sea-03b672010.2.azurestaticapps.net</origin>
                <origin>http://localhost:5173</origin>
                <origin>http://localhost:3000</origin>
            </allowed-origins>
            <allowed-methods>
                <method>GET</method>
                <method>POST</method>
                <method>PUT</method>
                <method>DELETE</method>
                <method>OPTIONS</method>
                <method>PATCH</method>
            </allowed-methods>
            <allowed-headers>
                <header>*</header>
            </allowed-headers>
            <expose-headers>
                <header>*</header>
            </expose-headers>
        </cors>
        <authentication-certificate certificate-id="apim-client-cert" />
    </inbound>
    <backend>
        <forward-request />
    </backend>
    <outbound />
    <on-error />
</policies>
```

### Configuración Azure Portal por backend

Para cada App Service / Function App:
1. **Configuration → General settings → Client certificate mode → Allow**
2. **Configuration → Application settings → `APIM_CERT_THUMBPRINT`**
   - Valor: `11E5BC9270C6FC8224A65300B1D2F2A6DA67887B`

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

### Authentication — Firebase + JWT

Flow completo:

1. `signInWithEmailAndPassword` → Firebase verifica credenciales
2. `onAuthStateChanged` fires → `exchangeFirebaseToken(firebaseUser)`
3. `POST /auth/token` con `{ idToken }` (Firebase ID token) → MS-2 verifica contra Firebase Identity Toolkit
4. MS-2 devuelve `{ token, user }` — `token` es un JWT firmado con `JWT_SECRET` (`sub = user.id`)
5. `setToken(token)` guarda el JWT en localStorage (`readflow_token`)
6. `setCurrentUser({ ...user, uid: firebaseUser.uid })` — `user.id` es el Cosmos DB ObjectId string
7. Todos los requests a MS-2 y MS-3 incluyen `Authorization: Bearer <token>`

**Critical:** `JWT_SECRET` debe estar configurado igual en MS-2 (firma) y MS-3 (verifica).

Auth functions exposed from `AuthContext` (`src/context/authContext.jsx`):

| Function | What it touches |
|---|---|
| `login(email, password)` | Firebase only |
| `register(name, username, email, password)` | Firebase + MS-2 POST /users + exchange token |
| `logout()` | Firebase + clearToken() |
| `updateProfileName(name)` | MS-2 PUT /users/:id |
| `updateProfileUsername(username)` | MS-2 PUT /users/:id |
| `updateProfileEmail(currentPassword, newEmail)` | Firebase reauth + MS-2 |
| `updateProfilePassword(currentPassword, newPassword)` | Firebase reauth only |

Token helpers en `src/services/authToken.js`: `getToken()`, `setToken()`, `clearToken()` — usan localStorage key `readflow_token`.

### Context Layer

Solo un provider envuelve la app (`src/main.jsx`) — **React.StrictMode eliminado** (causaba double useEffect en dev):

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
```

- **`AuthProvider`** — Firebase session + JWT + perfil de usuario. Renders `{!loadingAuth && children}`.
- **`AppDataProvider` eliminado** — ya no existe en el árbol. Cada página carga sus propios datos.

### Per-Page Data Hooks (`src/hooks/`)

Cada página carga solo lo que necesita. Todos usan AbortController para cancelar requests al navegar:

| Hook | Datos | AbortController |
|---|---|---|
| `useBooks()` | GET /books | Sí |
| `useCategories()` | mock local (no request real) | No |
| `useFavorites()` | GET /favorites | Sí |
| `useReadingProgress()` | GET /reading-progress | Sí |

Requests por página:
- `/home` → books + favorites + reading-progress
- `/biblioteca` → books + categories + favorites
- `/explorar-libros` → books + favorites
- `/detalle-libro` → books + favorites + reading-progress + cover-url
- `/lectura` → books + reading-progress + file-url
- `/admin-libros` → books + categories + reading-progress
- `/perfil` → cero requests (usa `currentUser` del auth)

### Service Layer

- `src/services/booksService.js` — API calls para books, categories (mock), reading-progress, favorites. `getBooks(signal)`, `getFavorites(signal)`, `getReadingProgress(signal)` aceptan AbortController signal.
- `src/services/notificationsService.js` — SignalR connection + like/like-status. `getToken()` incluido en todos los headers via `Authorization: Bearer`.
- `src/services/authToken.js` — getToken/setToken/clearToken en localStorage.
- `src/firebase.js` — inicializa Firebase app y exporta `auth`.

### Routing (`src/App.jsx`)

Routes guarded inline con `isAuthenticated`. `/registro` es público. Todos los imports son estáticos (no lazy loading — fue probado y revertido).

| Path | Page |
|---|---|
| `/login` | `loginPage.jsx` |
| `/registro` | `registroPage.jsx` |
| `/home` | `homePage.jsx` |
| `/biblioteca` | `bibliotecaPage.jsx` |
| `/explorar-libros` | `explorarLibrosPage.jsx` |
| `/perfil` | `perfilPage.jsx` |
| `/detalle-libro` | `detalleLibroPage.jsx` — recibe `libroId` + `from` via `location.state` |
| `/lectura` | `lecturaPage.jsx` — recibe `libroId` + `from` via `location.state` |
| `/admin-libros` | `adminLibrosPage.jsx` |
| `/nuevo-libro` | `formLibroPage.jsx` |
| `/editar-libro` | `formLibroPage.jsx` (edit mode, recibe `libroId` via `location.state`) |

### Navegación con `from` state

Para que el botón "Volver" regrese a la página correcta, cada página pasa `from` al navegar:

```js
// homePage → detalle
navigate("/detalle-libro", { state: { libroId: book.id, from: "/home" } })

// homePage → lectura (continuar leyendo)
navigate("/lectura", { state: { libroId: book.id, from: "/home" } })

// bibliotecaPage → detalle
navigate("/detalle-libro", { state: { libroId: book.id, from: "/biblioteca" } })
```

`detalleLibroPage` usa `location.state?.from || "/explorar-libros"` en el botón Volver y al eliminar libro.
`lecturaPage` usa `location.state?.from` — si existe navega directo, si no va a detalle-libro.

### Paginación

Componente `src/components/Pagination.jsx` — no se muestra si `totalPages <= 1`.

`PAGE_SIZE = 5` en todas las páginas. Aplicado en:
- `homePage` — "Continúa tus lecturas" y "Mi biblioteca"
- `explorarLibrosPage` — "Subidos por mí" y "De la comunidad" (paginaciones independientes)
- `bibliotecaPage` — "Mis libros" y "Libros guardados" (paginaciones independientes)
- `adminLibrosPage` — tabla de libros (resetea a página 1 al cambiar filtros)

### Book Cards — Tamaño uniforme

Todas las cards (`.bookCard` y `.explorCard`) tienen:
- Imagen: `aspect-ratio: 3/4`
- Body: `height: 180px; overflow: hidden`
- Título: `-webkit-line-clamp: 2`
- Autor: `text-overflow: ellipsis` (1 línea)
- Botón: `margin-top: auto` (siempre al fondo del body)

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

`password` siempre vacío — Firebase maneja la autenticación.
`id` es un Cosmos DB ObjectId string. Este mismo ID es el `sub` del JWT y el `nameid` del token SignalR.

---

## MS-1 — `api-functions/`

Azure Functions (Node.js) para Books CRUD, file/cover URLs y file uploads. Usa SQL Server.

### Azure Function App

- **Nombre:** `func-milibreria-api`
- **Runtime:** Node.js 20
- **Database:** Azure SQL Server (mssql)
- **Storage:** Azure Blob Storage (covers + PDFs)

### Commands

```bash
cd api-functions
npm start          # local development server
```

### Environment Variables (`local.settings.json`)

```json
{
  "SQL_CONNECTION_STRING": "Server=...",
  "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;...",
  "APIM_CERT_THUMBPRINT": ""
}
```

### Structure

```
api-functions/
├── host.json
├── package.json
└── src/functions/
    ├── certAuth.js           # checkApimCert() — valida X-ARR-ClientCert
    ├── books.js              # GET/POST /api/books + GET/PUT/DELETE /api/books/{id}
    ├── bookFileUrl.js        # GET /api/books/{id}/file-url (PDF SAS)
    ├── bookCoverUrl.js       # GET /api/books/{id}/cover-url (Cover SAS)
    ├── generateUploadUrl.js  # POST /api/generate-upload-url (Blob SAS)
    └── health.js             # GET /api/health (sin validación de cert)
```

### Endpoints

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/books` | Returns all books |
| POST | `/api/books` | Create book (requires `pdf_blob_name`) |
| GET | `/api/books/{id}` | Get book by id |
| PUT | `/api/books/{id}` | Update book |
| DELETE | `/api/books/{id}` | Delete book + blobs |
| GET | `/api/books/{id}/file-url` | SAS URL for PDF (30 min) |
| GET | `/api/books/{id}/cover-url` | SAS URL for cover image (30 min) |
| POST | `/api/generate-upload-url` | SAS URL to upload file to Blob Storage |
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

---

## MS-2 — `microservicios/ms2-nodejs/`

Node.js + Express microservice para Users, Auth JWT, Reading Progress y Favorites.

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

### Environment Variables

```
PORT=3000
COSMOS_CONNECTION_STRING=mongodb://...
APIM_CERT_THUMBPRINT=<thumbprint de apim-client-cert>
JWT_SECRET=<mismo valor que MS-3>
FIREBASE_API_KEY=<Firebase Web API Key>
```

### Structure

```
ms2-nodejs/
├── app.js                        # Express + certAuth + jwtAuth + routes
├── server.js                     # entry point
└── src/
    ├── config/db.js
    ├── middleware/
    │   ├── certAuth.js           # Valida X-ARR-ClientCert, omite /health
    │   └── jwtAuth.js            # Valida Bearer JWT, omite /health y /auth/token
    ├── models/
    │   ├── User.js
    │   ├── ReadingProgress.js
    │   └── Favorite.js
    ├── controllers/
    │   ├── authController.js     # POST /auth/token — intercambia Firebase idToken por JWT
    │   ├── userController.js
    │   ├── readingProgressController.js
    │   └── favoriteController.js
    └── routes/
        ├── authRoutes.js
        ├── userRoutes.js
        ├── readingProgressRoutes.js
        └── favoriteRoutes.js
```

### Endpoints — 15 operations

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/auth/token` | cert only | Recibe `{ idToken }` Firebase, devuelve `{ token, user }` |
| GET | `/users` | cert + JWT | |
| GET | `/users/:id` | cert + JWT | |
| POST | `/users` | cert + JWT | Registra usuario, debe guardar `firebaseUid` |
| PUT | `/users/:id` | cert + JWT | Returns full updated object |
| DELETE | `/users/:id` | cert + JWT | Returns `{ message, userId }` |
| GET | `/reading-progress` | cert + JWT | |
| GET | `/reading-progress/:id` | cert + JWT | |
| POST | `/reading-progress` | cert + JWT | |
| PUT | `/reading-progress/:id` | cert + JWT | Auto-updates `updatedAt` |
| DELETE | `/reading-progress/:id` | cert + JWT | |
| GET | `/favorites` | cert + JWT | |
| GET | `/favorites/:id` | cert + JWT | |
| POST | `/favorites` | cert + JWT | |
| DELETE | `/favorites/:id` | cert + JWT | |

### Database — Azure Cosmos DB for MongoDB (Serverless)

Database: `ms2db`. Collections: `users`, `readingprogresses`, `favorites`.

Todos los modelos usan `toJSON` transform: expone `id` (string), elimina `_id` y `__v`.
`ReadingProgress` y `Favorite` tienen unique compound indexes en `(userId, bookId)`.

### CI/CD

GitHub Actions: `.github/workflows/deploy-ms2.yml`
- Trigger: push a `main` tocando `microservicios/ms2-nodejs/**`, o `workflow_dispatch`
- Secret: `AZURE_WEBAPP_PUBLISH_PROFILE_MS2`

---

## MS-3 — `microservicios/api-notifications/`

Node.js + Express microservice para notificaciones en tiempo real y book likes.

### Azure App Service

- **Nombre:** `app-milibreria-notifications`
- **URL:** `app-milibreria-notifications-gybtdzdmfnb2b8ce.centralus-01.azurewebsites.net`
- **Runtime:** Node 22 LTS, Linux
- **Health:** `GET /health` → `{ status: "ok", service: "api-notifications" }`

### Commands

```bash
cd microservicios/api-notifications
npm start    # node server.js (production)
```

### Environment Variables

```
PORT=8080
SIGNALR_CONNECTION_STRING=Endpoint=https://...
SIGNALR_HUB_NAME=notifications
SQL_CONNECTION_STRING=Server=tcp:...
APIM_CERT_THUMBPRINT=11E5BC9270C6FC8224A65300B1D2F2A6DA67887B
JWT_SECRET=<mismo valor que MS-2>
NODE_ENV=production
```

### Structure

```
api-notifications/
├── certAuth.js      # Valida X-ARR-ClientCert, omite /health
├── jwtAuth.js       # Valida Bearer JWT (sub→req.user.id), omite /health
├── server.js        # Express app + todas las rutas
├── package.json
└── .deployment      # SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### Endpoints — 5 operations

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/health` | none | Health check |
| POST | `/notifications/negotiate` | cert + JWT | Genera SignalR token con `nameid = req.user.id` |
| POST | `/notifications/test-send` | cert + JWT | Envía notificación de prueba |
| POST | `/books/:id/like` | cert + JWT | Toggle like — no permite self-like (400) |
| GET | `/books/:id/like-status` | cert + JWT | Retorna `{ liked, likesCount }` |

### Database — Azure SQL Server (misma instancia que MS-1)

```sql
CREATE TABLE dbo.BookLikes (
    id INT PRIMARY KEY IDENTITY(1,1),
    book_id INT NOT NULL,
    actor_user_id NVARCHAR(100) NOT NULL,
    actor_name NVARCHAR(150),
    created_at DATETIME DEFAULT GETUTCDATE(),
    UNIQUE (book_id, actor_user_id)
);

CREATE TABLE dbo.Notifications (
    id INT PRIMARY KEY IDENTITY(1,1),
    recipient_user_id NVARCHAR(100) NOT NULL,
    actor_user_id NVARCHAR(100),
    actor_name NVARCHAR(150),
    book_id INT,
    type NVARCHAR(50),
    message NVARCHAR(500),
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETUTCDATE()
);
```

### SignalR Flow

1. Frontend llama `POST /notifications/negotiate` con `Authorization: Bearer <JWT>`
2. `jwtAuth` valida el JWT → `req.user.id = payload.sub` (Cosmos DB user ID)
3. MS-3 genera SignalR JWT con `nameid = req.user.id` y devuelve `{ url, accessToken, userId, hub }`
4. Frontend conecta al hub con `skipNegotiation: true` (WebSockets directo)
5. `accessTokenFactory` en el cliente hace una segunda llamada a negotiate para token fresco (con try/catch fallback al token inicial)
6. Cuando alguien da like: MS-3 llama `sendToUser(book.user_id, "notificationReceived", payload)`
7. `book.user_id` debe coincidir con el `nameid` del token SignalR del destinatario (ambos son el Cosmos DB ID)
8. **Importante:** Un usuario no puede dar like a su propio libro (MS-3 retorna 400)

### CI/CD

GitHub Actions: `.github/workflows/deploy-ms3.yml`
- Trigger: push a `main` tocando `microservicios/api-notifications/**`, o `workflow_dispatch`
- Secret: `AZURE_WEBAPP_PUBLISH_PROFILE_MS3`

---

## Microservices Architecture (Fase II)

```
Frontend (React)
      ↓
   APIM (Ocp-Apim-Subscription-Key + apim-client-cert → backends)
      ↓              ↓              ↓
MS-1 Functions  MS-2 Node.js   MS-3 Node.js
Books CRUD      Auth JWT +     Notifications + Likes
File/Cover URLs Users +        SignalR real-time
                ReadingProgress
                Favorites
      ↓              ↓              ↓
  Azure SQL    Cosmos DB       Azure SQL + SignalR
  (Activo)     (Activo)        (Activo)
```

### APIM — Estado de endpoints

| Endpoint | Estado | Backend |
|---|---|---|
| `/books*` (sin like) | Real — MS-1 | `ms1-functions` |
| `/auth*` | Real — MS-2 | `ms2-nodejs` |
| `/users*` | Real — MS-2 | `ms2-nodejs` |
| `/reading-progress*` | Real — MS-2 | `ms2-nodejs` |
| `/favorites*` | Real — MS-2 | `ms2-nodejs` |
| `/notifications*` | Real — MS-3 | `ms3-notifications` |
| `/books/:id/like*` | Real — MS-3 | `ms3-notifications` |
