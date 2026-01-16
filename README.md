# Park-App

Dashboard de analisis de operaciones de estacionamiento. Visualiza metricas de transacciones, ingresos, ubicaciones y patrones de uso.

## Requisitos

- Node.js 20+
- npm 9+

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/ArianaGonzabay/park-app.git
cd park-app
```

### 2. Descargar los datos

Descarga `archive.zip` desde [Releases](https://github.com/ArianaGonzabay/park-app/releases) y descomprimelo en la carpeta `archive/` del proyecto.

```
park-app/
└── archive/
    └── Parking_Transactions.csv
```

### 3. Instalar dependencias e importar datos

```bash
npm install
npm run import:csv
```

> La importacion puede tardar varios minutos debido al tamanio del archivo (~1.9 GB).

### 4. Iniciar el proyecto

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## Tecnologias

| Capa     | Tecnologias                        |
| -------- | ---------------------------------- |
| Frontend | React, Vite, TailwindCSS, Recharts |
| Backend  | Hono, Node.js, SQLite              |
| Monorepo | Turborepo, npm workspaces          |
