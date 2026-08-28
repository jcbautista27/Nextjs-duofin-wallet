import { prisma } from "@/lib/prisma";
import {
  ApiError,
  apiErrorResponse,
  requireActiveSpace,
} from "@/lib/api";
import { createCategorySchema } from "@/lib/validations/category";

export async function GET() {
  try {
    const { space } = await requireActiveSpace();

    const categories = await prisma.category.findMany({
      where: { spaceId: space.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    return Response.json({ categories });
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
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? "Datos inválidos"
      );
    }

    const existing = await prisma.category.findFirst({
      where: {
        spaceId: space.id,
        name: { equals: parsed.data.name, mode: "insensitive" },
        type: parsed.data.type,
      },
    });
    if (existing) {
      throw new ApiError(
        409,
        "Ya existe una categoría con ese nombre y tipo en tu espacio"
      );
    }

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name.trim(),
        type: parsed.data.type,
        isDefault: false,
        spaceId: space.id,
        createdById: user.id,
      },
    });

    return Response.json({ category }, { status: 201 });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
