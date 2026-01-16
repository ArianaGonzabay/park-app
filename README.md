# Park-App

Dashboard de operaciones de estacionamiento.

## Quick Start

```bash
# 1. Clonar el repositorio
git clone https://github.com/ArianaGonzabay/park-app.git
cd park-app

# 2. Descargar archive.zip de Releases y descomprimir en la carpeta archive/
# https://github.com/ArianaGonzabay/park-app/releases

# 3. Instalar dependencias
npm install

# 4. Importar datos del CSV a la base de datos
npm run import:csv

# 5. Iniciar el proyecto
npm run dev
```

El dashboard estara disponible en: http://localhost:3000

## Estructura del proyecto

```
park-app/
├── apps/
│   ├── web/       # Frontend React
│   └── api/       # Backend API
├── archive/       # CSV de datos (descargar de Releases)
└── packages/      # Configuraciones compartidas
```

## Stack tecnologico

- **Frontend**: React + Vite + TailwindCSS + Recharts
- **Backend**: Hono + Node.js + SQLite
