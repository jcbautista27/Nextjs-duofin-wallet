# Especificaciones Técnicas — Duofin

**Versión:** 1.1
**Fecha:** Agosto 2026
**Documento base:** Duofin_Especificaciones_Funcionales.md
**Propósito:** Guiar a un agente de código (ej. OpenCode) en la construcción de la aplicación.

---

## 1. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Framework full-stack | **Next.js 14+ (App Router)** | React + API Routes en un solo proyecto. |
| Lenguaje | **TypeScript** | Tipado estricto en todo el proyecto. |
| Base de datos | **PostgreSQL** | Relacional, integridad referencial entre usuarios, espacios y transacciones. |
| ORM | **Prisma** | Migraciones y cliente tipado. |
| Autenticación | **NextAuth.js (Auth.js)** | Estrategia de credenciales (email + password) para el MVP. |
| Estilos | **Tailwind CSS** | |
| Tema claro/oscuro | **next-themes** | Maneja preferencia de sistema + toggle manual, persistido en cookie/localStorage. |
| Componentes UI | **shadcn/ui** | Componentes accesibles basados en Radix + Tailwind. |
| Validación de formularios | **Zod + React Hook Form** | Validación tanto en cliente como en servidor (API routes). |
| Hosting | **Vercel** (app) + **Neon o Supabase** (Postgres) | Planes gratuitos suficientes para MVP. **Si se usa Supabase:** el proyecto requiere DOS variables de entorno — `DATABASE_URL` (puerto 6543, pooler) y `DIRECT_URL` (puerto 5432, conexión directa) — porque Prisma necesita una conexión directa para ejecutar migraciones. Ver `datasource db` en la sección 3. |
| Gestor de paquetes | **pnpm** | |

---

## 2. Arquitectura general

```
Cliente (Next.js/React + shadcn/ui)
        │
        ▼
Next.js API Routes (/app/api/...)
        │
        ▼
Prisma Client
        │
        ▼
PostgreSQL (Neon/Supabase)
```

- Arquitectura **monolítica modular** dentro de un solo proyecto Next.js (frontend + backend).
- Autenticación mediante **NextAuth.js**, con sesiones JWT.
- Todas las operaciones de escritura/lectura de datos financieros pasan por API Routes protegidas por sesión.

---

## 3. Modelo de datos (Prisma Schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id            String        @id @default(cuid())
  name          String
  email         String        @unique
  passwordHash  String
  createdAt     DateTime      @default(now())

  spaceId       String?
  space         Space?        @relation(fields: [spaceId], references: [id])

  transactions  Transaction[]
  categories    Category[]
  notifications Notification[]
  devices       Device[]

  invitationsSent     Invitation[] @relation("InvitationSender")
}

model Space {
  id            String        @id @default(cuid())
  name          String        @default("Espacio Duofin")
  status        SpaceStatus   @default(ACTIVE)
  createdAt     DateTime      @default(now())

  users         User[]
  categories    Category[]
  invitations   Invitation[]
}

enum SpaceStatus {
  ACTIVE
  ARCHIVED
}

model Invitation {
  id            String        @id @default(cuid())
  email         String
  status        InvitationStatus @default(PENDING)
  createdAt     DateTime      @default(now())

  spaceId       String
  space         Space         @relation(fields: [spaceId], references: [id])

  invitedById   String
  invitedBy     User          @relation("InvitationSender", fields: [invitedById], references: [id])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
}

model Category {
  id            String        @id @default(cuid())
  name          String
  type          TransactionType
  isDefault     Boolean       @default(false)
  createdAt     DateTime      @default(now())

  spaceId       String
  space         Space         @relation(fields: [spaceId], references: [id])

  createdById   String?
  createdBy     User?         @relation(fields: [createdById], references: [id])

  transactions  Transaction[]
}

model Transaction {
  id            String        @id @default(cuid())
  amount        Decimal       @db.Decimal(10, 2)
  type          TransactionType
  date          DateTime
  note          String?
  createdAt     DateTime      @default(now())

  userId        String
  user          User          @relation(fields: [userId], references: [id])

  categoryId    String
  category      Category      @relation(fields: [categoryId], references: [id])

  notifications Notification[]
}

enum TransactionType {
  INCOME
  EXPENSE
}

model Notification {
  id            String        @id @default(cuid())
  message       String
  isRead        Boolean       @default(false)
  createdAt     DateTime      @default(now())

  userId        String        // usuario que RECIBE la notificación
  user          User          @relation(fields: [userId], references: [id])

  transactionId String?
  transaction   Transaction?  @relation(fields: [transactionId], references: [id])
}

model Device {
  id              String   @id @default(cuid())
  deviceTokenHash String   @unique   // token largo, aleatorio, guardado en cookie httpOnly en el navegador
  pinHash         String?            // hash del PIN de 6 dígitos (bcrypt); null si el PIN no está configurado/fue desactivado
  pinEnabled      Boolean  @default(false)
  createdAt       DateTime @default(now())
  lastUsedAt      DateTime @default(now())

  userId          String
  user            User     @relation(fields: [userId], references: [id])
}
```

**Notas del modelo:**
- `Space` representa el "espacio de pareja". Cuando se desvincula, pasa a `status: ARCHIVED` (no se elimina).
- `Category` pertenece siempre a un `Space` (no a un usuario individual), lo cual refleja que son compartidas.
- Un `User` solo puede tener un `spaceId` a la vez (relación 1:N desde `Space`), cumpliendo la regla de "un espacio a la vez".
- Las categorías predefinidas (`isDefault: true`) se crean automáticamente al crear un nuevo `Space`, vía seed script.
- `Device` representa un dispositivo/navegador donde el usuario configuró login rápido con PIN. El `deviceTokenHash` identifica el dispositivo (guardado como cookie httpOnly `deviceToken` sin hashear en el cliente); el `pinHash` nunca se compara en cliente, siempre server-side. Si `pinEnabled` es `false`, ese dispositivo requiere login completo.

---

## 4. Endpoints principales (API Routes)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de nuevo usuario. |
| POST | `/api/auth/[...nextauth]` | Login / manejo de sesión (NextAuth). |
| POST | `/api/spaces` | Crear espacio de pareja. |
| POST | `/api/spaces/invite` | Invitar a la pareja por correo. |
| POST | `/api/spaces/invite/accept` | Aceptar invitación. |
| POST | `/api/spaces/leave` | Desvincularse del espacio (archiva el `Space`). |
| GET | `/api/transactions` | Listar transacciones (con filtros: usuario, categoría, fecha). |
| POST | `/api/transactions` | Crear transacción. |
| PUT | `/api/transactions/:id` | Editar transacción propia. |
| DELETE | `/api/transactions/:id` | Eliminar transacción propia. |
| GET | `/api/categories` | Listar categorías del espacio (predefinidas + personalizadas). |
| POST | `/api/categories` | Crear categoría personalizada. |
| PUT | `/api/categories/:id` | Editar categoría personalizada propia. |
| DELETE | `/api/categories/:id` | Eliminar categoría personalizada propia. |
| GET | `/api/balance` | Balance individual + combinado del espacio. |
| GET | `/api/notifications` | Listar notificaciones del usuario (nuevas transacciones de la pareja). |
| PUT | `/api/notifications/:id/read` | Marcar notificación como leída. |
| POST | `/api/auth/pin/setup` | Configurar PIN de 6 dígitos para el dispositivo actual (requiere sesión ya autenticada). Crea/actualiza el registro `Device`. |
| POST | `/api/auth/pin/verify` | Iniciar sesión rápida con PIN + `deviceToken` (cookie). Devuelve sesión si el PIN coincide. |
| DELETE | `/api/auth/pin` | Desactivar el PIN en el dispositivo actual (`pinEnabled: false`). |

**Reglas de autorización comunes a todos los endpoints de datos:**
- Todo endpoint debe validar sesión activa (NextAuth).
- Un usuario solo puede editar/eliminar sus propias transacciones y categorías propias personalizadas.
- Las lecturas (`GET /transactions`, `GET /balance`) devuelven datos combinados del `Space` al que pertenece el usuario autenticado.

---

## 5. Estructura de carpetas propuesta

```
duofin/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts              # Categorías predefinidas
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Dashboard / balance
│   │   │   ├── transactions/
│   │   │   ├── categories/
│   │   │   └── space/                # Invitar pareja / desvincular
│   │   └── api/
│   │       ├── auth/
│   │       ├── spaces/
│   │       ├── transactions/
│   │       ├── categories/
│   │       ├── balance/
│   │       └── notifications/
│   ├── components/
│   │   ├── ui/                       # Componentes shadcn/ui
│   │   ├── transactions/
│   │   ├── categories/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── validations/              # Esquemas Zod
│   └── types/
├── .env.example
├── package.json
└── README.md
```

---

## 6. Consideraciones de seguridad

- Contraseñas hasheadas con **bcrypt** antes de guardarse (`passwordHash`).
- Todas las API routes validan que el `spaceId` de los recursos consultados/modificados coincida con el `spaceId` del usuario autenticado.
- Variables sensibles (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`) gestionadas vía variables de entorno, nunca hardcodeadas.
- **PIN de acceso rápido:** el PIN se hashea con bcrypt igual que la contraseña (nunca en texto plano). El `deviceToken` es un valor aleatorio largo (≥32 bytes) generado server-side, guardado como cookie `httpOnly`, `secure`, `sameSite=strict` — nunca accesible desde JavaScript del cliente. Verificar PIN sin el `deviceToken` válido correspondiente debe fallar siempre (el PIN por sí solo, sin el dispositivo correcto, no es suficiente). Limitar intentos fallidos de PIN (ej. bloquear tras 5 intentos y exigir login completo) para prevenir fuerza bruta sobre 6 dígitos.

---

## 7. Notas para el agente de código (OpenCode u otro)

- Este documento debe leerse **junto con** `Duofin_Especificaciones_Funcionales.md` antes de empezar a construir.
- Se recomienda construir en el siguiente orden (ver backlog en documento separado si se solicita):
  1. Setup del proyecto (Next.js + TypeScript + Tailwind + shadcn/ui).
  2. Configuración de Prisma + PostgreSQL + seed de categorías predefinidas.
  3. Autenticación (registro, login, sesión).
  4. Creación de espacio + invitación de pareja.
  5. CRUD de transacciones.
  6. CRUD de categorías personalizadas.
  7. Dashboard de balance (individual + combinado).
  8. Notificaciones in-app.
- Cualquier decisión técnica no cubierta aquí (ej. librería específica de notificaciones) debe resolverse siguiendo el stack ya definido, evitando introducir dependencias no listadas sin antes confirmarlo.

---

## Changelog
- **v1.1** (2026-08-30): agregado modelo `Device` y endpoints de PIN (login rápido), agregado `next-themes` para modo oscuro. Ver `docs/changes/2026-08-30_pin-login-y-modo-oscuro.md`.
- **v1.0** (2026-08-2026): versión inicial del MVP.
