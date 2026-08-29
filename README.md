# Duofin

Web app de finanzas personales para parejas. Registro 100% manual de ingresos y gastos con una vista combinada del balance de la pareja.

## Stack

Next.js 16 (App Router) · TypeScript · PostgreSQL (Supabase) · Prisma 7 · NextAuth.js v5 · Tailwind CSS v4 · shadcn/ui · Zod + React Hook Form · pnpm

## Requisitos

- Node.js 20+
- pnpm 11
- Base de datos PostgreSQL (Supabase / Neon)

## Setup local

```bash
# 1. Instalar dependencias (genera el cliente Prisma automáticamente)
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
#   - Rellena DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET y NEXTAUTH_URL
#   - Genera el secret con: openssl rand -base64 32

# 3. Aplicar migraciones y sembrar categorías predefinidas
pnpm db:migrate
pnpm db:seed

# 4. Levantar el servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

> Nota: si modificas `prisma/schema.prisma`, vuelve a generar el cliente con `pnpm prisma generate` (ya se ejecuta en `postinstall`).

## Scripts

| Comando | Descripción |
| ------- | ----------- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | ESLint |
| `pnpm db:migrate` | Aplica migraciones pendientes (`migrate deploy`) |
| `pnpm db:seed` | Siembra las categorías predefinidas |

## Despliegue en Vercel

1. Sube este repositorio a GitHub.
2. Importa el repo en [vercel.com](https://vercel.com) mediante "New Project".
3. Confirma los comandos por defecto (build: `pnpm build`, salida: estándar de Next.js).
4. En **Settings → Environment Variables**, agrega las mismas variables de `.env`:
   - `DATABASE_URL` (connection string de Supabase por pooler)
   - `DIRECT_URL` (conexión directa puerto 5432, usada por las migraciones)
   - `NEXTAUTH_SECRET` (genera uno de producción con `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (la URL de tu deploy, ej. `https://duofin.vercel.app`)
5. En la pestaña de Redis/Supabase del dashboard de Vercel o el servicio que uses, ejecuta las migraciones:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```
   contra la base de datos de producción apuntando a las variables de entorno de producción.
6. Despliega. La primera visita hará el build y aplicará todo.

> No subas `.env` al repositorio. Solo se commitea `.env.example`.

## Documentación

Toda la documentación del proyecto vive en `docs/`: especificaciones funcionales y técnicas, sistema de diseño, wireframes y el backlog.
