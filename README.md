# Park-App

Dashboard de operaciones de estacionamiento.

## Requisitos previos

- Node.js 20+
- npm 9+

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/ArianaGonzabay/park-app.git
cd park-app
```

### 2. Descargar los datos

1. Ve a la seccion de [Releases](https://github.com/ArianaGonzabay/park-app/releases)
2. Descarga el archivo `archive.zip`
3. Descomprime el contenido en la carpeta `archive/` del proyecto
4. Verifica que exista: `archive/Parking_Transactions.csv`

### 3. Instalar dependencias

```bash
npm install
```

### 4. Importar datos a la base de datos

```bash
npm run import:csv
```

Este proceso puede tardar varios minutos (el CSV tiene ~1.9 GB).

### 5. Iniciar el proyecto

```bash
npm run dev
```

El dashboard estara disponible en: http://localhost:3000

## Comandos disponibles

```bash
npm run dev          # Inicia frontend y backend en modo desarrollo
npm run build        # Compila todos los paquetes
npm run check-types  # Verifica tipos TypeScript
npm run lint         # Ejecuta linter en todos los paquetes
npm run format       # Formatea el codigo
npm run import:csv   # Importa el CSV a la base de datos SQLite
```

## Estructura del proyecto

```
park-app/
├── apps/
│   ├── web/     # Frontend React + Vite + Recharts
│   └── api/     # Backend Hono + SQLite
├── archive/     # Aqui va el CSV de datos
└── packages/
    ├── shared/             # Tipos y schemas compartidos
    ├── typescript-config/  # Configuracion TypeScript
    └── eslint-config/      # Configuracion ESLint
```

## Stack tecnologico

- **Frontend**: React + Vite + TailwindCSS + Recharts + TanStack Query
- **Backend**: Hono + Node.js + SQLite
- **Shared**: TypeScript + Zod
- **Build**: Turborepo + npm workspaces
