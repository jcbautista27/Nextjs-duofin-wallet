import { prisma } from "@/lib/prisma";
import {
  ApiError,
  apiErrorResponse,
  requireActiveSpace,
} from "@/lib/api";
import { updateTransactionSchema } from "@/lib/validations/transaction";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { user, space } = await requireActiveSpace();
    const { id } = await context.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!transaction) {
      throw new ApiError(404, "Transacción no encontrada");
    }
    if (transaction.userId !== user.id) {
      throw new ApiError(
        403,
        "Solo puedes editar tus propias transacciones"
      );
    }
    if (transaction.category.spaceId !== space.id) {
      throw new ApiError(403, "Esta transacción no pertenece a tu espacio");
    }

    const body = await request.json().catch(() => null);
    const parsed = updateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? "Datos inválidos"
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.amount !== undefined) data.amount = parsed.data.amount;
    if (parsed.data.date !== undefined) data.date = new Date(parsed.data.date);
    if (parsed.data.note !== undefined) data.note = parsed.data.note?.trim() || null;
    if (parsed.data.categoryId !== undefined) {
      const cat = await prisma.category.findUnique({
        where: { id: parsed.data.categoryId },
      });
      if (!cat || cat.spaceId !== space.id) {
        throw new ApiError(400, "La categoría no pertenece a tu espacio");
      }
      data.categoryId = parsed.data.categoryId;
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, type: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return Response.json({ transaction: { ...updated, amount: String(updated.amount) } });
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

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!transaction) {
      throw new ApiError(404, "Transacción no encontrada");
    }
    if (transaction.userId !== user.id) {
      throw new ApiError(
        403,
        "Solo puedes eliminar tus propias transacciones"
      );
    }
    if (transaction.category.spaceId !== space.id) {
      throw new ApiError(403, "Esta transacción no pertenece a tu espacio");
    }

    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { transactionId: id } }),
      prisma.transaction.delete({ where: { id } }),
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
