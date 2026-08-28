import { prisma } from "@/lib/prisma";
import { apiErrorResponse, requireUser } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireUser();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        transaction: {
          select: {
            id: true,
            amount: true,
            type: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    const serialized = notifications.map((n) => ({
      ...n,
      transaction: n.transaction
        ? { ...n.transaction, amount: String(n.transaction.amount) }
        : null,
    }));

    return Response.json({ notifications: serialized, unreadCount });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
