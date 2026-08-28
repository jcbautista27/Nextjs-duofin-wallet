import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse, requireUser } from "@/lib/api";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new ApiError(404, "Notificación no encontrada");
    }

    if (notification.userId !== user.id) {
      throw new ApiError(403, "No autorizado");
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return Response.json({ notification: updated });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
