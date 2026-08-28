import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse, requireUser } from "@/lib/api";

export async function POST() {
  try {
    const user = await requireUser();

    if (!user.spaceId) {
      throw new ApiError(404, "No perteneces a ningún espacio de pareja");
    }

    const space = await prisma.space.findUnique({
      where: { id: user.spaceId },
    });
    if (!space) {
      throw new ApiError(404, "No perteneces a ningún espacio de pareja");
    }

    if (space.status === "ACTIVE") {
      // Primera desvinculación: se archiva el Space (no se elimina) y el
      // usuario que sale queda libre para crear/unirse a otro espacio.
      // El otro miembro conserva spaceId hacia el espacio archivado
      // (acceso de solo consulta al histórico combinado).
      await prisma.$transaction([
        prisma.space.update({
          where: { id: space.id },
          data: { status: "ARCHIVED" },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { spaceId: null },
        }),
        // Las invitaciones pendientes del espacio archivado caducan.
        prisma.invitation.updateMany({
          where: { spaceId: space.id, status: "PENDING" },
          data: { status: "EXPIRED" },
        }),
      ]);
    } else {
      // El espacio ya estaba archivado: solo se desvincula el usuario,
      // que conserva acceso a su propio historial.
      await prisma.user.update({
        where: { id: user.id },
        data: { spaceId: null },
      });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
