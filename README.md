# Kinmap

Kinmap es un **prototipo de red social** desarrollado como proyecto final de FP Superior. Permite a los usuarios crear cuentas, formar **círculos** (grupos privados de amigos), publicar fotos y videos, interactuar con likes y comentarios, y mostrar/compartir **ubicación geográfica** en cada publicación o en tiempo real.

La idea central es conectar de forma cercana: cada post muestra desde dónde fue creado (con un mapa integrado) y los usuarios pueden optar por compartir su ubicación en vivo dentro de sus círculos.

## Características principales

- Registro y autenticación de usuarios (login / signup)
- Creación y gestión de **círculos** (grupos privados: solo los miembros ven y publican contenido)
- Publicación de **posts** con texto, fotos y videos
- Interacciones: **likes**, **comentarios** y feed por círculo
- **Geolocalización automática** en publicaciones (muestra ubicación aproximada en mapa)
- Opción de **compartir ubicación en tiempo real** (con consentimiento)
- Interfaz responsive (móvil y desktop)

## Tecnologías utilizadas

### Frontend
- React.js
- Tailwind CSS (o similar)
- Leaflet.js + OpenStreetMap
- Axios para consumo de API

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT para autenticación
- Multer para subida de archivos multimedia

## Instalación y ejecución local

### Requisitos previos
- Node.js ≥ 18
- MongoDB (local o MongoDB Atlas)

### Pasos

1. Clonar el repositorio
   ```bash
   git clone https://github.com/Skomode/Kinmap.git
   cd Kinmap

2. Instala dependenciasBash# Backend
    ```bash
   cd backend
   npm install
    ```

3. Configuracion de variables de entorno

   Crea el archivo backend/.env con:env
     ```env
      PORT=5000
      MONGODB_URI=mongodb://localhost:27017/kinmap
      JWT_SECRET=KEY_WORD
      ```
4. Iniciar backend

   ```bash
   cd backend
   npm start
   # o npm run dev si tienes nodemon
   ```
5. Inicia el frontendBashcd ../frontend
npm start

   ```bash
   cd ../frontend
   npm start
   ```
La app abre en: http://localhost:3000
