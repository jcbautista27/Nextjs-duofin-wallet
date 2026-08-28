import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse, requireUser } from "@/lib/api";
import { acceptInviteSchema } from "@/lib/validations/space";

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json().catch(() => null);
    const parsed = acceptInviteSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Identificador de invitación inválido");
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: parsed.data.invitationId },
      include: { space: true },
    });
    if (!invitation) {
      throw new ApiError(404, "La invitación no existe");
    }
    if (invitation.status !== "PENDING") {
      throw new ApiError(409, "La invitación ya no está pendiente");
    }
    if (invitation.space.status !== "ACTIVE") {
      throw new ApiError(409, "El espacio asociado ya no está activo");
    }
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ApiError(
        403,
        "Esta invitación fue enviada a otro correo electrónico"
      );
    }

    // Regla de negocio: si el usuario ya pertenece a otro Space activo,
    // debe salir de él antes de aceptar.
    if (user.spaceId) {
      const currentSpace = await prisma.space.findUnique({
        where: { id: user.spaceId },
      });
      if (currentSpace?.status === "ACTIVE") {
        throw new ApiError(
          409,
          "Ya perteneces a un espacio activo. Desvincúrate primero."
        );
      }
    }

    // Máximo dos miembros por espacio de pareja.
    const memberCount = await prisma.user.count({
      where: { spaceId: invitation.spaceId },
    });
    if (memberCount >= 2) {
      throw new ApiError(409, "El espacio ya tiene dos miembros");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { spaceId: invitation.spaceId },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
