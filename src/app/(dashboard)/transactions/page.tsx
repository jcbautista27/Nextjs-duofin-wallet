import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { TransactionList } from "@/components/transactions/transaction-list";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.spaceId) redirect("/space");

  const space = await prisma.space.findUnique({
    where: { id: user.spaceId },
  });
  if (!space || space.status !== "ACTIVE") redirect("/space");

  const [categories, users, transactions] = await Promise.all([
    prisma.category.findMany({
      where: { spaceId: space.id },
      orderBy: [{ type: "asc" }, { isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.user.findMany({
      where: { spaceId: space.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.transaction.findMany({
      where: { category: { spaceId: space.id } },
      include: {
        category: { select: { id: true, name: true, type: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">
        Transacciones
      </h1>

      <TransactionList
        initialTransactions={transactions.map((t) => ({
          ...t,
          amount: String(t.amount),
          date: t.date.toISOString(),
        }))}
        categories={categories}
        users={users}
        currentUserId={user.id}
      />
    </div>
  );
}
