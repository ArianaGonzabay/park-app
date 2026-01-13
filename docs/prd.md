# PRD — Park-App

**Producto:** Park-App (app móvil)

## 1. Resumen

Park-App es una aplicación móvil que conecta a conductores con una red de parqueaderos (privados, centros comerciales, instituciones, etc.) para **ver disponibilidad de cupos en tiempo real**, **reservar un espacio antes de llegar** y **pagar desde el teléfono**, reduciendo el estrés y el tiempo perdido buscando estacionamiento.

## 2. Contexto y oportunidad

### 2.1 Posicionamiento del problema

**El problema de** la incertidumbre sobre cupos disponibles en parqueaderos cercanos al destino **afecta a** conductores (particulares, turistas, estudiantes, repartidores) y a operadores/proveedores de parqueaderos (privados, comercios, instituciones) **cuyo impacto es** pérdida de tiempo, combustible y puntualidad para el conductor; y baja ocupación/ingresos en horas valle para el parqueadero.

**Una solución exitosa sería** ofrecer una app con mapa interactivo que muestre disponibilidad en tiempo real y permita reservar anticipadamente.

### 2.2 Posicionamiento del producto/servicio

- **Para:** conductores que desean optimizar su tiempo y reducir el estrés al estacionar en zonas concurridas.
- **Quienes:** necesitan una forma rápida y segura de encontrar y garantizar un espacio antes de llegar.
- **Park-App:** una aplicación móvil.
- **Que:** muestra parqueaderos cercanos con disponibilidad (idealmente en tiempo real) y permite reservar.
- **A diferencia de:** búsqueda tradicional “dando vueltas” o mapas genéricos (p. ej., Google Maps/Waze).
- **Nuestro producto:** no solo muestra ubicación; **garantiza cupo** mediante **reserva confirmada**.

## 3. Objetivos

### 3.1 Objetivos de negocio

1. Alcanzar liquidez del marketplace (usuarios y socios parqueaderos) en la(s) primera(s) ciudad(es).
2. Incrementar ocupación de parqueaderos afiliados y generar ingresos por comisión.
3. Construir una base de usuarios recurrentes con alta retención.

### 3.2 Objetivos de usuario

1. Encontrar parqueadero **cercano** de manera rápida.
2. Asegurar un cupo con **reserva confirmada**.
3. Pagar de forma ágil y recibir confirmaciones/notificaciones.

## 4. Alcance

### 4.1 MVP (Primera versión)

**A. Experiencia del conductor (Usuario)**

1. **Registro / inicio de sesión** (email/contraseña; social login fuera del demo)
2. **Mapa interactivo** con parqueaderos cercanos.
3. **Ficha de parqueadero**: ubicación, tarifas, horarios, servicios, capacidad estimada, calificaciones.
4. **Disponibilidad**: indicador de cupos disponibles (tiempo real donde aplique; si no, estimación/actualización manual del socio).
5. **Reserva**: seleccionar parqueadero + hora/ventana estimada de llegada; recibir **confirmación** (código QR o numérico).
6. **Pagos en app**: métodos digitales (tarjeta; y soporte extensible a billeteras).
7. **Notificaciones**: confirmación de reserva, recordatorio previo, cambios/cancelaciones.
8. **Historial de reservas** y **favoritos**.
9. **Perfil**: datos personales y del vehículo.

**B. Experiencia del propietario/administrador de parqueadero (Socio)**

1. **Onboarding de socio**: registro del parqueadero, validación básica.
2. **Gestión de disponibilidad/capacidad** (manual inicialmente; opción de integración futura).
3. **Gestión de reservas**: ver reservas próximas/completadas/canceladas; check-in por código.
4. **Gestión de tarifas** y horarios.
5. **Panel básico**: ocupación/reservas/ingresos (resumen).
6. **Gestión de reseñas**: ver calificaciones y comentarios.

### 4.2 Fuera de alcance (por ahora)

- Sensores IoT obligatorios para disponibilidad (se considera futuro).
- Asignación de puesto específico con croquis del parqueadero (se sugiere como mejora futura).
- Planes corporativos/abonos mensuales.
- Integraciones complejas (ERP, facturación avanzada, etc.).

## 5. Usuarios y buyer personas (resumen)

**Conductor particular (Carlos):** profesional, valora puntualidad y paga por comodidad.

**Conductor profesional (Carla):** necesita seguridad y control del tiempo.

**Turista (Miguel):** no conoce la ciudad; prioriza seguridad y planificación.

**Estudiante (Sofía):** sensible al precio; busca opciones económicas.

**Repartidor (Javier):** necesita rapidez para paradas cortas; valora flujo ágil.

**Socio parqueadero (Propietario/Administrador):** busca aumentar ocupación e ingresos, y reducir fricción operativa.

## 6. Principales casos de uso

1. “Voy a una reunión; quiero reservar parqueadero cerca del destino”.
2. “No conozco la zona; necesito un parqueadero seguro cerca de una atracción”.
3. “Necesito un parqueo por 10–15 min para una entrega”.
4. “Soy administrador; quiero ver reservas del día y ajustar tarifas”.

## 7. Requisitos funcionales

### 7.1 Mapa y descubrimiento

- **RF-01**: La app debe mostrar un mapa con parqueaderos cercanos al usuario (por GPS) y permitir búsqueda por dirección/lugar.
- **RF-02**: Cada parqueadero debe mostrar un estado de disponibilidad (cupo disponible / limitado / lleno) y un conteo cuando aplique.
- **RF-03**: Filtros: precio, distancia, horario, tipo (cubierto/descubierto), seguridad, servicios.

### 7.2 Ficha de parqueadero

- **RF-04**: Mostrar tarifas, horarios, métodos de pago, políticas (cancelación), fotos, servicios y calificación.
- **RF-05**: Mostrar ruta/indicaciones desde la ubicación actual.

### 7.3 Reservas

- **RF-06**: Permitir seleccionar ventana de llegada y confirmar reserva.
- **RF-07**: Generar un **código de reserva** (QR o numérico) para validación.
- **RF-08**: Permitir cancelación según política (demo: sin cargo hasta 10 min antes; luego 20%).

### 7.4 Pagos

- **RF-09**: Permitir pago en app (tarjeta) con recibo digital.
- **RF-10**: Registrar el detalle de la transacción y asociarlo a la reserva.

### 7.5 Notificaciones

- **RF-11**: Notificar confirmación, recordatorio, cancelación y estado (p. ej., “por expirar”).

### 7.6 Cuenta y perfil

- **RF-12**: Gestión de perfil y vehículo(s).
- **RF-13**: Historial de reservas y favoritos.

### 7.7 Panel del socio

- **RF-14**: Ver reservas por estado (próximas, activas, completadas, canceladas).
- **RF-15**: Confirmar check-in (escaneo QR / ingreso código).
- **RF-16**: Actualizar capacidad/disponibilidad (manual en MVP).
- **RF-17**: Configurar tarifas/hora pico/promociones simples.
- **RF-18**: Ver KPIs básicos (reservas, ocupación aproximada, ingresos).

## 8. Requisitos no funcionales

- **RNF-01 (Rendimiento):** tiempo de carga aceptable en pantallas clave (Mapa/Detalle/Reserva).
- **RNF-02 (Disponibilidad):** el sistema debe tolerar picos (eventos, horas pico).
- **RNF-03 (Seguridad):** cifrado en tránsito, manejo seguro de pagos (cumplimiento del proveedor de pago), protección de datos personales.
- **RNF-04 (Privacidad):** consentimiento para geolocalización y analítica.
- **RNF-05 (Usabilidad):** flujos mínimos para completar reserva (pocos pasos).
- **RNF-06 (Confiabilidad):** manejo robusto de fallas (reintentos; estados idempotentes en reservas/pagos).

## 9. Flujos de usuario (alto nivel)

### 9.1 Conductor

1. Abrir app → login
2. Ver mapa → seleccionar parqueadero
3. Ver detalle → elegir hora/ventana → reservar
4. Pagar → recibir confirmación (QR)
5. Llegar → presentar QR → completar

### 9.2 Socio (propietario)

1. Abrir app/portal → login
2. Revisar reservas del día
3. Validar check-in
4. Ajustar disponibilidad/tarifas
5. Revisar métricas y reseñas

## 10. Monetización

**Modelo principal:** comisión por reserva confirmada.

- **Quién paga:** usuario (conductor) paga la reserva/servicio; el operador entrega el servicio.
- **Cómo:** comisión **10%** sobre el ticket por reserva confirmada (demo).

**Modelo complementario (futuro):** publicidad/featured listings, acuerdos B2B con centros comerciales y eventos.

## 11. Métricas y KPIs

### 11.1 Adquisición

- Descargas por canal
- % conversión instalación → registro

### 11.2 Activación y engagement

- Usuarios Activos Diarios/Mensuales (DAU/MAU)
- Tasa de finalización de reserva (Reservas completadas / iniciadas)
- Retención por cohorte (D7/D30/D90)

### 11.3 Monetización

- Ingreso promedio por usuario (ARPU)
- Tasa de conversión a pago
- LTV
- CAC
- Ratio LTV/CAC

### 11.4 Operación y calidad

- Tasa de ocupación por socio (horas reservadas / horas disponibles)
- Tiempo medio de resolución de soporte
- Crash rate
- Latencia/tiempo de carga

## 12. Instrumentación y analítica

- **Eventos recomendados (ejemplos):**
  - `app_open`, `signup_started`, `signup_completed`
  - `location_permission_granted`
  - `parking_viewed`, `filter_applied`, `search_performed`
  - `reservation_started`, `reservation_confirmed`, `reservation_cancelled`
  - `payment_started`, `payment_success`, `payment_failed`
  - `checkin_success`
  - `review_submitted`

- **Herramientas sugeridas:** analítica de eventos (p. ej., Firebase Analytics) + analítica cualitativa (p. ej., grabación de sesiones/mapas de calor).

## 13. Dataset y dashboard (para seguimiento interno)

### 13.1 Procesos de negocio (mínimo)

- Registro de usuarios
- Afiliación de socios
- Reservas
- Pagos y facturación
- Calificaciones y reseñas

### 13.2 Indicadores mínimos (al menos 3)

- Crecimiento del ecosistema (usuarios y socios nuevos, mensual)
- Tasa de finalización de reserva
- Ocupación por socio

## 14. Riesgos y mitigaciones

1. **Confiabilidad de disponibilidad (datos):**
   - _Riesgo:_ disponibilidad inexacta afecta confianza.
   - _Mitigación:_ MVP con reglas claras (tiempo de actualización, buffer de cupos para reservas), auditoría y penalidades/recompensas para socios.

2. **Efecto red / masa crítica:**
   - _Riesgo:_ pocos socios → mala propuesta al usuario; pocos usuarios → poco valor al socio.
   - _Mitigación:_ enfoque geográfico por zonas, alianzas con centros comerciales/eventos, incentivos de onboarding.

3. **Fraude o incumplimiento de reservas:**
   - _Mitigación:_ QR, penalidad por no-show, ventana de llegada, verificación.

4. **Pagos y chargebacks:**
   - _Mitigación:_ proveedor de pago confiable, conciliación y logs.

## 15. Arquitectura, stack y datos

### 15.1 Stack técnico (decisión actual)

- **Lenguaje:** 100% **TypeScript** (sin JavaScript en el repo).
- **Build system / Monorepo:** **Turborepo**.
  - Estructura sugerida:
    - `apps/web`: React (Vite o similar)
    - `apps/api`: API en Node.js
    - `packages/shared`: tipos, schemas, validación
    - `packages/ui`: componentes reutilizables

- **Frontend (React):**
  - **TanStack Query** para fetching/caching de datos.
  - **TanStack Table** para tablas grandes (si aplica dashboard).
  - Router moderno (TanStack Router o equivalente) según necesidades.

- **Backend (Node.js, sin Express/Nest):**
  - Framework recomendado: **Hono** (TypeScript-friendly, basado en Web Standards, compatible con Node).
  - Alternativa: servidor nativo `node:http` + router mínimo (si desean cero framework).
  - **API:** REST (JSON) + contratos tipados (p. ej., Zod para validar y derivar tipos).

- **Autenticación:** JWT (access/refresh) + hashing seguro de contraseñas.
- **Mapas/GPS:** **OpenStreetMap + MapLibre GL JS** + geolocalización.
- **Notificaciones:** Push (p. ej., FCM) y/o email transaccional.
- **Pagos:** **Stripe (modo prueba)**; moneda principal **USD**.

### 15.2 Datos (CSV grande) y rendimiento

> **Nota:** el dataset esperado es un **CSV** muy grande (2GB+) con estructura tipo transacciones. Ejemplo de encabezados:
> `ID, Source, Duration in Minutes, Start Time, End Time, Amount, Kiosk ID, App Zone ID, App Zone Group, Payment Method, Location Group, Last Updated`.

**Implicación clave:** un CSV de 2GB+ **no** es ideal para cargas repetidas, filtros interactivos o analítica (dashboard). Para buen rendimiento y costos de lectura, se recomienda:

1. **Ingesta/normalización (batch)**

- **RF-21 (Ingesta streaming):** el backend debe procesar el CSV en **streaming** (sin cargarlo completo en RAM).
- Normalizar tipos:
  - `ID`: entero/identificador
  - `Duration in Minutes`: number
  - `Start Time`, `End Time`, `Last Updated`: datetime
  - `Amount`: decimal
  - IDs de zona/kiosk: string/number

2. **Conversión a Parquet (recomendado para analítica y filtros)**

- **RF-22 (Conversión):** generar una copia en **Parquet** (columnar, comprimido) para consultas rápidas.
- **RF-23 (Particionado):** particionar por fecha (p. ej., `Start Time` → `yyyy/mm/dd`) para acelerar rangos de tiempo.
- **RF-24 (Cache/índices lógicos):** mantener metadatos/estadísticos por partición (conteos, min/max de fechas, suma de Amount).

3. **Consulta**

- Backend expone endpoints agregados (p. ej., `revenue_by_day`, `top_zones`, `payments_by_method`).
- Para exploración avanzada, considerar motor embebible como DuckDB (en servidor) o DuckDB-WASM (en navegador) según alcance.

**Criterios de aceptación (rendimiento datos):**

- Importar 2GB+ sin OOM (out-of-memory) y con progreso/logs.
- Consultas típicas por rango de fechas y agregaciones (SUM/COUNT) responden en tiempos aceptables (objetivo demo: **p95 ≤ 2s** para rango de **30 días**).

### 15.3 Tipado fuerte (TypeScript) para el CSV de transacciones

> Objetivo: garantizar un **contrato de datos** claro entre ingesta (CSV) → normalización → API/Frontend.

#### 15.3.1 Encabezados esperados (raw CSV)

```text
ID,Source,Duration in Minutes,Start Time,End Time,Amount,Kiosk ID,App Zone ID,App Zone Group,Payment Method,Location Group,Last Updated
```

**Zona horaria oficial (demo):** UTC.

#### 15.3.2 Modelo raw (tal como viene del CSV)

```ts
// packages/shared/src/csv/transactions.types.ts

export type CsvTransactionRowRaw = {
  ID: string // viene como texto en CSV
  Source: string
  'Duration in Minutes': string
  'Start Time': string // formato tipo: 03/16/2023 08:19:05 PM
  'End Time': string
  Amount: string
  'Kiosk ID': string
  'App Zone ID': string
  'App Zone Group': string
  'Payment Method': string
  'Location Group': string
  'Last Updated': string
}
```

#### 15.3.3 Modelo normalizado (para API/consultas)

```ts
// packages/shared/src/domain/transactions.ts

export type PaymentMethod = 'CARD' | 'CASH' | 'OTHER' | (string & {})
export type SourceType = 'Parking Meters' | 'Other' | (string & {})

export type TransactionRecord = {
  id: number
  source: SourceType
  durationMinutes: number
  startTime: Date
  endTime: Date
  /**
   * Para evitar errores por punto flotante, se sugiere almacenar dinero en centavos.
   * (9.16 USD → 916)
   */
  amountCents: bigint
  kioskId: string
  appZoneId?: string
  appZoneGroup?: string
  paymentMethod: PaymentMethod
  locationGroup?: string
  lastUpdated: Date
}
```

#### 15.3.4 Validación y parsing (schema tipado)

```ts
// packages/shared/src/csv/transactions.schema.ts

import { z } from 'zod'

// Helper: parse "MM/DD/YYYY hh:mm:ss AM/PM" a Date.
// Implementación demo con date-fns (manteniendo 100% TS en el repo).
const parseUsDateTime = (value: string): Date => {
  // Placeholder de contrato: debe lanzar error si el formato es inválido.
  // Ejemplo: 03/16/2023 08:19:05 PM
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) throw new Error('Invalid datetime: ' + value)
  return d
}

export const CsvTransactionRowRawSchema = z.object({
  ID: z.string().min(1),
  Source: z.string().min(1),
  'Duration in Minutes': z.string().min(1),
  'Start Time': z.string().min(1),
  'End Time': z.string().min(1),
  Amount: z.string().min(1),
  'Kiosk ID': z.string().min(1),
  'App Zone ID': z.string().optional().default(''),
  'App Zone Group': z.string().optional().default(''),
  'Payment Method': z.string().min(1),
  'Location Group': z.string().optional().default(''),
  'Last Updated': z.string().min(1),
})

export const TransactionRecordSchema = CsvTransactionRowRawSchema.transform((r) => {
  const amount = Number(r['Amount'])
  if (!Number.isFinite(amount)) throw new Error('Invalid amount: ' + r['Amount'])

  // Convertimos a centavos con redondeo seguro
  const amountCents = BigInt(Math.round(amount * 100))

  return {
    id: Number(r['ID']),
    source: (r['Source'] || 'Other') as string,
    durationMinutes: Number(r['Duration in Minutes']),
    startTime: parseUsDateTime(r['Start Time']),
    endTime: parseUsDateTime(r['End Time']),
    amountCents,
    kioskId: r['Kiosk ID'],
    appZoneId: r['App Zone ID'] || undefined,
    appZoneGroup: r['App Zone Group'] || undefined,
    paymentMethod: (r['Payment Method'] || 'OTHER') as string,
    locationGroup: r['Location Group'] || undefined,
    lastUpdated: parseUsDateTime(r['Last Updated']),
  }
})

export type CsvTransactionRowRaw = z.infer<typeof CsvTransactionRowRawSchema>
export type TransactionRecord = z.infer<typeof TransactionRecordSchema>
```

#### 15.3.5 Contratos de API (ejemplos)

- `GET /analytics/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|kiosk|zone|paymentMethod`
  - Respuesta tipada: series agregadas de `sum(amountCents)` y `count(transactions)`.

- `GET /analytics/transactions?from=...&to=...&limit=...&cursor=...`
  - Paginación por cursor (recomendado en datasets grandes).

#### 15.3.6 Criterios de aceptación (tipado fuerte)

- Todo endpoint y DTO compila con TypeScript en modo `strict`.
- La ingesta rechaza filas con fechas/montos inválidos (con reporte de errores).
- El frontend consume tipos compartidos desde `packages/shared` (sin duplicar modelos).

## 16. Roadmap propuesto

### Fase 0 — Descubrimiento (1–2 semanas)

- Validación con 5–10 parqueaderos y 20–50 usuarios.
- Validar política de cancelación/no-show (demo: sin cargo hasta 10 min antes; luego 20%).

### Fase 1 — MVP (4–8 semanas)

- Mapa + detalle + reservas + pago + notificaciones.
- Panel socio básico.

### Fase 2 — Crecimiento (8–12 semanas)

- Mejoras de búsqueda/filtros, promociones, ratings.
- Optimización de embudo (UX).

### Fase 3 — Diferenciación (futuro)

- Integración con sensores / automatización.
- Selección de puesto con croquis.
- Integraciones B2B y planes.

## 17. Criterios de aceptación (MVP)

- Un usuario nuevo puede **registrarse** y ver parqueaderos en el mapa.
- Un usuario puede **completar una reserva** y recibir confirmación (QR/código).
- Un usuario puede **pagar** y ver un recibo asociado a la reserva.
- El socio puede **ver y validar** una reserva (check-in).
- La app registra eventos clave de analítica para medir embudo y estabilidad.

## 18. Anexos

- Prototipo (Figma): `https://www.figma.com/file/PLACEHOLDER/park-app-demo`.
- Dominio demo: `park-app-demo.example` (evidencia placeholder: registrar Namecheap; fecha 2026-01-13).
