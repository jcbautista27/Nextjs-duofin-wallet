import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HeaderNav } from "@/components/header-nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let notifications: {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    transaction: { id: string; amount: string; type: string; category: { name: string } } | null;
  }[] = [];
  let unreadCount = 0;

  if (session?.user?.id) {
    const [rawNotifications, count] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
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
      }),
      prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ]);

    notifications = rawNotifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      transaction: n.transaction
        ? { ...n.transaction, amount: String(n.transaction.amount) }
        : null,
    }));
    unreadCount = count;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNav
        userName={session?.user?.name ?? "Duofin"}
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
