import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma driver adapter (@prisma/adapter-pg) usa el cliente `pg`, que no
  // debe ser bundleado por el bundler de Vercel/Next (código nativo y
  // dependencias dinámicas). Se externaliza en runtime.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
