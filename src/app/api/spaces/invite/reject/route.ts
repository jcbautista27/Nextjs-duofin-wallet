import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse, requireUser } from "@/lib/api";

// Rechazar una invitación pendiente dirigida al email del usuario
// autenticado (botón "Rechazar" del wireframe). La invitación pasa a EXPIRED.
export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = (await request.json().catch(() => null)) as {
      invitationId?: string;
    } | null;
    if (!body?.invitationId) {
      throw new ApiError(400, "Identificador de invitación inválido");
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: body.invitationId },
      include: { space: true },
    });

    if (
      !invitation ||
      invitation.status !== "PENDING" ||
      invitation.space.status !== "ACTIVE"
    ) {
      throw new ApiError(404, "La invitación no está pendiente");
    }
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ApiError(403, "Esta invitación pertenece a otro usuario");
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
