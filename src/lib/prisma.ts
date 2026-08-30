import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

export function getPrisma(): InstanceType<typeof PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Se usa DATABASE_URL (pooler de Supabase en modo transacción, puerto 6543
  // con ?pgbouncer=true) para el runtime de Prisma. Este pooler está pensado
  // para serverless (Vercel): multiplexa muchas conexiones de cliente sobre
  // pocas conexiones físicas, sin el límite de 15 de la conexión directa.
  // (Usar DIRECT_URL directa agotaba el pool_size de 15 ante varias
  // instancias serverless -> EMAXCONNSESSION. Ver notas en espacio-api.)
  //
  // IMPORTANTE: el pooler en modo transacción NO soporta transacciones
  // interactivas ($transaction(fn)); hay que usar queries simples o
  // $transaction([...]) en modo batch, como se hace en los endpoints.
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definida. Configúrala en .env (ver .env.example)."
    );
  }

  // Pool pequeño y con timeouts finitos: apropiado para serverless. Fallar
  // rápido (connectionTimeoutMillis finito) evita colas interminables.
  const adapter = new PrismaPg({
    connectionString,
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
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
