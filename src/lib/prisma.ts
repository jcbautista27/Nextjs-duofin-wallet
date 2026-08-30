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

  // Límite de conexiones en el pool: la conexión directa de Supabase permite
  // como máximo 15 sesiones simultáneas. Se deja un margen razonable para
  // que varias funciones serverless compartan el pool sin agotarlo.
  const adapter = new PrismaPg({
    connectionString,
    max: 3,
  });
  const client = new PrismaClient({ adapter });

  // Se cachea el cliente en el global SIEMPRE (también en producción) para
  // reutilizar el pool de conexiones entre requests serverless de Vercel.
  // (Next.js limpia el global en desarrollo; no cachearlo en producción
  //  agotaba el pool y producía EMAXCONNSESSION.)
  globalForPrisma.prisma = client;

  return client;
}

export const prisma = new Proxy({} as InstanceType<typeof PrismaClient>, {
  get(_, prop) {
    return Reflect.get(getPrisma(), prop);
  },
});
