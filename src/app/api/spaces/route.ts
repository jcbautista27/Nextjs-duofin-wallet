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
    const space = await prisma.$transaction(async (tx) => {
      const created = await tx.space.create({
        data: { name: "Espacio Duofin", status: "ACTIVE" },
      });

      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((category) => ({
          name: category.name,
          type: category.type,
          isDefault: true,
          spaceId: created.id,
        })),
      });

      await tx.user.update({
        where: { id: user.id },
        data: { spaceId: created.id },
      });

      return created;
    });

    return Response.json({ space }, { status: 201 });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
