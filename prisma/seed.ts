// Seed — Categorías predefinidas de Duofin
// Ejecutar con `pnpm prisma db seed` para verificar.
// Los datos viven en src/lib/categories.ts (fuente única reutilizable).

import { DEFAULT_CATEGORIES } from "../src/lib/categories";

async function main() {
  console.log(
    `Duofin seed: ${DEFAULT_CATEGORIES.length} categorías predefinidas definidas:`
  );
  for (const category of DEFAULT_CATEGORIES) {
    console.log(`  - ${category.name} (${category.type})`);
  }
  console.log(
    "\nEstas categorías se crean automáticamente al crear un nuevo Space\n(no se precargan globales, ver nota del backlog tarea 1.5)."
  );
}

main();
