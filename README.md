# ReadFlow Web

Aplicación web del ecosistema **ReadFlow**, desarrollada con **React + Vite** y desplegada en **Azure Static Web Apps**.
El sistema permite gestionar una biblioteca digital, visualizar libros en PDF, consultar portadas almacenadas en Azure Blob Storage y utilizar notificaciones en tiempo real mediante Azure SignalR.

## Descripción

ReadFlow Web es una plataforma de lectura digital orientada a la administración y consulta de libros en línea.
La aplicación se conecta con servicios en Azure mediante Azure API Management, permitiendo centralizar las solicitudes hacia microservicios, base de datos, almacenamiento de archivos y notificaciones.

## Alcance de la segunda entrega

En esta segunda entrega se implementa una versión funcional de la aplicación web conectada con servicios en la nube de Azure. El sistema ya no se limita únicamente a mostrar una interfaz, sino que integra almacenamiento, base de datos, API Gateway, microservicios y comunicación en tiempo real.

Las principales implementaciones de esta entrega son:

* Conexión del frontend web con Azure API Management.
* Integración con Azure Functions para la gestión principal de libros, usuarios, favoritos y progreso de lectura.
* Uso de Azure SQL Database como base de datos principal del sistema.
* Almacenamiento de archivos PDF y portadas mediante Azure Blob Storage.
* Visualización de libros, portadas y documentos PDF desde la aplicación web.
* Registro, edición y eliminación de libros con control por usuario propietario.
* Implementación de favoritos y progreso de lectura.
* Implementación de un microservicio independiente de notificaciones en Azure App Service.
* Registro de likes por libro mediante las tablas `BookLikes` y `Notifications`.
* Envío de notificaciones en tiempo real utilizando Azure SignalR Service.
* Configuración de seguridad mediante HTTPS, CORS, Subscription Key, certificados y variables de entorno.
* Despliegue de la aplicación web en Azure Static Web Apps.

Esta entrega representa la integración de los principales componentes del ecosistema ReadFlow, permitiendo que la aplicación web interactúe con servicios reales en la nube y soporte funcionalidades dinámicas como lectura de libros, gestión de contenido y notificaciones en tiempo real.

## Funcionalidades principales

* Registro e inicio de sesión de usuarios.
* Visualización de libros disponibles.
* Consulta del detalle de cada libro.
* Lectura de archivos PDF desde Azure Blob Storage.
* Visualización de portadas almacenadas en Blob Storage.
* Registro, edición y eliminación de libros.
* Control de libros por usuario propietario.
* Gestión de favoritos.
* Registro de progreso de lectura.
* Sistema de likes por libro.
* Notificaciones en tiempo real cuando un usuario da like a un libro.
* Integración con Azure API Management.
* Despliegue automatizado con GitHub Actions y Azure Static Web Apps.

## Arquitectura general

El sistema utiliza una arquitectura basada en servicios en la nube:

* **Frontend:** React + Vite en Azure Static Web Apps.
* **API Gateway:** Azure API Management.
* **Microservicio principal:** Azure Functions para gestión de libros, usuarios, favoritos y progreso de lectura.
* **Microservicio de notificaciones:** Azure App Service con Node.js + Express.
* **Base de datos:** Azure SQL Database.
* **Almacenamiento:** Azure Blob Storage para PDFs y portadas.
* **Tiempo real:** Azure SignalR Service.
* **Seguridad:** Subscription Key, CORS, certificados y variables de entorno.

## Tecnologías utilizadas

* React
* Vite
* JavaScript
* HTML5
* CSS3
* Node.js
* Express.js
* Azure Static Web Apps
* Azure API Management
* Azure Functions
* Azure App Service
* Azure SQL Database
* Azure Blob Storage
* Azure SignalR Service
* GitHub Actions


## Enlaces

Aplicación web desplegada:

```text
https://brave-sea-03b672010.2.azurestaticapps.net
```

Repositorio de aplicación móvil:

```text
https://github.com/Viktor1712/DesignReadAppProject
```


## Seguridad

El sistema utiliza diferentes mecanismos de seguridad:

* Uso de HTTPS.
* Subscription Key para consumir APIs desde API Management.
* CORS configurado para permitir solo orígenes autorizados.
* Variables de entorno para evitar exponer configuraciones sensibles.
* Certificados para conexiones seguras entre servicios.
* Validación del usuario propietario antes de editar o eliminar libros.

## Servicio de notificaciones

El sistema de notificaciones funciona mediante un microservicio en Azure App Service.

Endpoints principales:

```text
POST /notifications/negotiate
GET  /books/{id}/like-status
POST /books/{id}/like
```

Flujo de notificación:

1. Un usuario entra al detalle de un libro.
2. El frontend consulta si el usuario ya dio like.
3. El usuario da o quita like.
4. El microservicio registra el cambio en Azure SQL.
5. Si corresponde, se crea una notificación.
6. Azure SignalR envía la notificación en tiempo real al dueño del libro.

## Base de datos

La base de datos se encuentra en Azure SQL Database.
Tablas principales utilizadas:

* `Books`
* `Users`
* `Favorites`
* `ReadingProgress`
* `BookLikes`
* `Notifications`        
