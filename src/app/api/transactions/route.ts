import { prisma } from "@/lib/prisma";
import {
  ApiError,
  apiErrorResponse,
  requireActiveSpace,
} from "@/lib/api";
import {
  createTransactionSchema,
  transactionFiltersSchema,
} from "@/lib/validations/transaction";

export async function GET(request: Request) {
  try {
    const { space } = await requireActiveSpace();

    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(searchParams.entries());
    const filters = transactionFiltersSchema.parse(raw);

    const where: Record<string, unknown> = {
      category: { spaceId: space.id },
    };

    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) {
        (where.date as Record<string, unknown>).gte = new Date(filters.from);
      }
      if (filters.to) {
        const toDate = new Date(filters.to);
        toDate.setHours(23, 59, 59, 999);
        (where.date as Record<string, unknown>).lte = toDate;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, type: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    const serialized = transactions.map((t) => ({
      ...t,
      amount: String(t.amount),
    }));

    return Response.json({ transactions: serialized });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user, space } = await requireActiveSpace();

    const body = await request.json().catch(() => null);
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? "Datos inválidos"
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category || category.spaceId !== space.id) {
      throw new ApiError(
        400,
        "La categoría no pertenece a tu espacio"
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parsed.data.amount,
        type: parsed.data.type,
        categoryId: parsed.data.categoryId,
        date: new Date(parsed.data.date),
        note: parsed.data.note?.trim() || null,
        userId: user.id,
      },
      include: {
        category: { select: { id: true, name: true, type: true } },
        user: { select: { id: true, name: true } },
      },
    });

    // Notificar al partner (fire-and-forget, no bloquear).
    const partner = await prisma.user.findFirst({
      where: {
        spaceId: space.id,
        id: { not: user.id },
      },
    });
    if (partner) {
      const label = parsed.data.type === "EXPENSE" ? "un gasto" : "un ingreso";
      prisma.notification
        .create({
          data: {
            message: `${user.name} registró ${label} en ${category.name}`,
            userId: partner.id,
            transactionId: transaction.id,
          },
        })
        .catch(() => {});
    }

    return Response.json({ transaction: { ...transaction, amount: String(transaction.amount) } }, { status: 201 });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
