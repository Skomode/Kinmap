# Kinmap

Kinmap es un **prototipo de red social** desarrollado como proyecto final de FP Superior. Permite a los usuarios crear cuentas, formar **círculos** (grupos privados de amigos), publicar fotos y videos, interactuar con likes y comentarios, y mostrar/compartir **ubicación geográfica** en cada publicación o en tiempo real.

La idea central es conectar de forma cercana: cada post muestra desde dónde fue creado (con un mapa integrado) y los usuarios pueden optar por compartir su ubicación en vivo dentro de sus círculos.

## ✨ Características principales

- Registro y autenticación de usuarios (login / signup)
- Creación y gestión de **círculos** (grupos privados: solo los miembros ven y publican contenido)
- Publicación de **posts** con texto, fotos y videos
- Interacciones: **likes**, **comentarios** y feed por círculo
- **Geolocalización automática** en publicaciones (muestra ubicación aproximada en mapa)
- Opción de **compartir ubicación en tiempo real** (con consentimiento)
- Interfaz responsive (móvil y desktop)

## 🛠️ Tecnologías utilizadas

### Frontend
- React.js
- Tailwind CSS (o similar)
- Leaflet.js + OpenStreetMap (o Mapbox / Google Maps API) para mapas
- Axios para consumo de API

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT para autenticación
- Multer para subida de archivos multimedia
- (Opcional) Socket.io para funcionalidades en tiempo real

## 🚀 Instalación y ejecución local

### Requisitos previos
- Node.js ≥ 18
- MongoDB (local o MongoDB Atlas)

### Pasos

1. Clona el repositorio
   ```bash
   git clone https://github.com/Skomode/Kinmap.git
   cd Kinmap

Instala dependenciasBash# Backend
cd backend
npm install

# Frontend (abrir otra terminal)
cd ../frontend
npm install
Configura variables de entorno
Crea el archivo backend/.env con el siguiente contenido:textPORT=5000
MONGODB_URI=mongodb://localhost:27017/kinmap
JWT_SECRET=tu_secreto_super_seguro_aqui

# Si usas Mapbox o Google Maps:

# MAPBOX_TOKEN=pk.tu_token_mapbox_o_google
Inicia el backendBashcd backend
npm start

# o npm run dev si tienes nodemon configurado
Inicia el frontendBashcd frontend
npm start

La aplicación debería estar disponible en: http://localhost:3000

