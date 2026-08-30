import { prisma } from "@/lib/prisma";
import {
  ApiError,
  apiErrorResponse,
  requireUser,
} from "@/lib/api";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

export async function POST() {
  try {
    const user = await requireUser();

    const activeSpace = user.spaceId
      ? await prisma.space.findUnique({ where: { id: user.spaceId } })
      : null;
    if (activeSpace?.status === "ACTIVE") {
      throw new ApiError(
        409,
        "Ya perteneces a un espacio de pareja. Desvincúrate antes de crear uno nuevo."
      );
    }

    // Regla de negocio: las categorías predefinidas se instancian al crear
    // cada Space (backlog 1.5 / 3.1).
    //
    // No se usa $transaction(fn) interactiva: no es compatible con el pooler
    // de Supabase en modo transacción (P2028 "Transaction not found"). Se
    // usan queries simples + $transaction([...]) en modo batch.
    const space = await prisma.space.create({
      data: { name: "Espacio Duofin", status: "ACTIVE" },
    });

    await prisma.$transaction([
      prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((category) => ({
          name: category.name,
          type: category.type,
          isDefault: true,
          spaceId: space.id,
        })),
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { spaceId: space.id },
      }),
    ]);

    return Response.json({ space }, { status: 201 });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
