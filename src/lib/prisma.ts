import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

export function getPrisma(): InstanceType<typeof PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Se usa DIRECT_URL (conexión directa a Supabase, sin pgbouncer) para Prisma.
  // El pooler de Supabase en modo transaccional (DATABASE_URL con
  // pgbouncer=true) no garantiza que los queries de una transacción
  // interactiva ($transaction) caigan en la misma conexión, lo que produce
  // P2028 "Transaction not found". Al ser una app de baja concurrencia,
  // la conexión directa es lo correcto.
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DIRECT_URL (o DATABASE_URL) no está definida. Configúrala en .env (ver .env.example)."
    );
  }

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = new Proxy({} as InstanceType<typeof PrismaClient>, {
  get(_, prop) {
    return Reflect.get(getPrisma(), prop);
  },
});
