import { prisma } from "@/lib/prisma";
import {
  ApiError,
  apiErrorResponse,
  requireActiveSpace,
} from "@/lib/api";
import { updateCategorySchema } from "@/lib/validations/category";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { user, space } = await requireActiveSpace();
    const { id } = await context.params;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new ApiError(404, "Categoría no encontrada");
    }
    if (category.spaceId !== space.id) {
      throw new ApiError(403, "Esta categoría no pertenece a tu espacio");
    }
    if (category.isDefault) {
      throw new ApiError(403, "No se pueden editar categorías predefinidas");
    }
    if (category.createdById !== user.id) {
      throw new ApiError(
        403,
        "Solo puedes editar categorías que tú creaste"
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? "Datos inválidos"
      );
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        spaceId: space.id,
        name: { equals: parsed.data.name, mode: "insensitive" },
        type: category.type,
        id: { not: id },
      },
    });
    if (duplicate) {
      throw new ApiError(
        409,
        "Ya existe una categoría con ese nombre y tipo en tu espacio"
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name: parsed.data.name.trim() },
    });

    return Response.json({ category: updated });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { user, space } = await requireActiveSpace();
    const { id } = await context.params;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new ApiError(404, "Categoría no encontrada");
    }
    if (category.spaceId !== space.id) {
      throw new ApiError(403, "Esta categoría no pertenece a tu espacio");
    }
    if (category.isDefault) {
      throw new ApiError(
        403,
        "No se pueden eliminar categorías predefinidas"
      );
    }
    if (category.createdById !== user.id) {
      throw new ApiError(
        403,
        "Solo puedes eliminar categorías que tú creaste"
      );
    }

    const txCount = await prisma.transaction.count({
      where: { categoryId: id },
    });
    if (txCount > 0) {
      throw new ApiError(
        409,
        "No se puede eliminar: existen transacciones asociadas a esta categoría"
      );
    }

    await prisma.category.delete({ where: { id } });

    return Response.json({ ok: true });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
