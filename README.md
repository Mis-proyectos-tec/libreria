# ReadFlow Web

Aplicación web del ecosistema **ReadFlow**, diseñada para ofrecer una experiencia de lectura digital conectada con la API en Azure y la aplicación móvil.  
Este proyecto permite acceder a la biblioteca digital desde la web y forma parte de una solución que busca sincronizar la experiencia de lectura entre distintas plataformas.

## Descripción del proyecto

ReadFlow Web es la versión web de una plataforma de lectura de libros digitales en formato PDF.  
Su propósito es brindar una interfaz accesible y moderna para visualizar libros, organizar el contenido y mantener una integración con los demás componentes del proyecto.

Este sistema forma parte de un ecosistema compuesto por:

- Aplicación web
- Aplicación móvil
- API desplegada en Azure

## Características principales

- Visualización de libros digitales desde una interfaz web.
- Organización de contenido por categorías.
- Integración con servicios en la nube.
- Experiencia conectada con el ecosistema ReadFlow.
- Despliegue automatizado mediante GitHub Actions y Azure Static Web Apps.

## Tecnologías utilizadas

- Vite
- JavaScript
- HTML5
- CSS3
- Azure Static Web Apps
- GitHub Actions

## Requisitos previos

Antes de ejecutar el proyecto de manera local, asegúrate de tener instalado:

- Node.js
- npm
- Git

## Instalación y ejecución local

### 1. Clonar el repositorio

    git clone https://github.com/IsmaTEC24/libreria

### 2. Ingresar a la carpeta del proyecto

    cd libreria

### 3. Instalar dependencias

    npm install

### 4. Ejecutar la aplicación en modo desarrollo

    npm run dev

### 5. Abrir en el navegador

Normalmente la aplicación estará disponible en:

    http://localhost:5173

## Scripts disponibles

### Ejecutar en desarrollo

    npm run dev

### Generar build de producción

    npm run build

### Previsualizar build de producción

    npm run preview

## Build de producción

Para generar la versión lista para despliegue, ejecuta:

    npm run build

Esto creará la carpeta:

    dist

En dicha carpeta se almacenan los archivos finales de la aplicación listos para producción.

Para revisar localmente la versión compilada, ejecuta:

    npm run preview

## Despliegue en Azure Static Web Apps

La aplicación está conectada a **Azure Static Web Apps** mediante **GitHub Actions**, por lo que cada cambio enviado al repositorio puede desplegarse automáticamente.

### Pasos para desplegar una nueva versión

1. Realizar los cambios necesarios en el proyecto.
2. Guardar los archivos modificados.
3. Agregar los cambios al control de versiones:

    git add .

4. Crear un commit con un mensaje descriptivo:

    git commit -m "Actualizacion de la aplicacion web"

5. Subir los cambios al repositorio remoto:

    git push origin main

> Si la rama principal de despliegue no es `main`, reemplázala por la rama correspondiente.

Después del `push`, GitHub Actions ejecutará automáticamente el proceso de compilación y despliegue.

## Verificación del despliegue

Después de subir cambios al repositorio, se recomienda:

1. Ingresar al repositorio en GitHub.
2. Abrir la pestaña **Actions**.
3. Verificar que el workflow haya finalizado correctamente.
4. Ingresar al enlace público de la aplicación y comprobar que los cambios ya estén visibles.

## Enlaces del proyecto

### Aplicación web desplegada

https://brave-sea-03b672010.2.azurestaticapps.net

### Repositorio de la aplicación móvil

https://github.com/Viktor1712/DesignReadAppProject

## Estructura general del proyecto

La aplicación sigue una estructura orientada al desarrollo frontend con Vite.  
Durante el proceso de compilación, los archivos finales se generan en la carpeta:

    dist

## Consideraciones importantes

- La aplicación utiliza **Vite**, por lo que el build se genera en la carpeta `dist`.
- El despliegue depende de la configuración del workflow de **GitHub Actions**.
- Si se modifican rutas internas de la aplicación, se debe revisar correctamente la configuración de `staticwebapp.config.json` para evitar errores 404 al recargar páginas.
- Las variables sensibles o configuraciones privadas no deben subirse directamente al repositorio.
- Se recomienda mantener una estructura clara de commits para facilitar el seguimiento del proyecto.

## Relación con el ecosistema ReadFlow

Este proyecto web complementa la aplicación móvil y la API en Azure, permitiendo que la solución funcione como un ecosistema unificado de lectura digital.  
La intención del proyecto es ofrecer una experiencia consistente entre plataformas y centralizar el acceso a la biblioteca digital.

## Estado del proyecto

Proyecto académico en desarrollo.

## Autores

Desarrollado como parte del proyecto **ReadFlow**.
