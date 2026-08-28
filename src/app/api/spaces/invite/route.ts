import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse, requireActiveSpace } from "@/lib/api";
import { inviteSchema } from "@/lib/validations/space";

export async function POST(request: Request) {
  try {
    const { user, space } = await requireActiveSpace();

    const body = await request.json().catch(() => null);
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        parsed.error.issues[0]?.message ?? "Email inválido"
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    if (email === user.email.toLowerCase()) {
      throw new ApiError(400, "No puedes invitarte a ti mismo");
    }

    // No invitar a alguien que ya es miembro de este espacio.
    const existingMember = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" }, spaceId: space.id },
    });
    if (existingMember) {
      throw new ApiError(400, "Esta persona ya es parte de tu espacio");
    }

    // Un espacio de pareja tiene un máximo de dos miembros.
    const memberCount = await prisma.user.count({ where: { spaceId: space.id } });
    if (memberCount >= 2) {
      throw new ApiError(409, "El espacio ya tiene dos miembros");
    }

    const pendingInvitation = await prisma.invitation.findFirst({
      where: {
        spaceId: space.id,
        status: "PENDING",
        email: { equals: email, mode: "insensitive" },
      },
    });
    if (pendingInvitation) {
      throw new ApiError(409, "Ya existe una invitación pendiente para este email");
    }

    const invitation = await prisma.invitation.create({
      data: {
        email,
        status: "PENDING",
        spaceId: space.id,
        invitedById: user.id,
      },
    });

    return Response.json({ invitation }, { status: 201 });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
