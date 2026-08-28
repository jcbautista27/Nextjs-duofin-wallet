import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // El CLI (migraciones/introspección) usa la conexión directa de Supabase
  // (DIRECT_URL, puerto 5432). El cliente runtime usa DATABASE_URL (pooler),
  // ver src/lib/prisma.ts.
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
