import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { PinSetupBanner } from "@/components/pin-setup-banner";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/login");

  if (!user.spaceId) {
    return (
      <>
        <PinSetupBanner />
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <svg
            viewBox="0 0 64 40"
            className="h-10 w-16 opacity-60"
            aria-hidden={true}
          >
            <circle cx="22" cy="20" r="16" fill="#1F6F5C" opacity="0.85" />
            <circle cx="42" cy="20" r="16" fill="#7A3F5E" opacity="0.85" />
            <ellipse cx="32" cy="20" rx="6.5" ry="13" fill="#C9A227" />
          </svg>
          <h1 className="font-display text-2xl font-semibold">
            Hola, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            Aún no tienes un espacio de pareja. Crea uno o acepta una invitación
            para empezar a registrar ingresos y gastos en conjunto.
          </p>
          <Link
            href="/space"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium"
          >
            Crear espacio
          </Link>
        </div>
      </>
    );
  }

  const space = await prisma.space.findUnique({
    where: { id: user.spaceId },
  });
  if (!space || space.status !== "ACTIVE") redirect("/space");

  const [members, categories, rawTransactions] = await Promise.all([
    prisma.user.findMany({
      where: { spaceId: space.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({
      where: { spaceId: space.id },
      orderBy: [{ type: "asc" }, { isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.transaction.findMany({
      where: { category: { spaceId: space.id } },
      include: {
        category: { select: { id: true, name: true, type: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  const transactions = rawTransactions.map((t) => ({
    ...t,
    amount: String(t.amount),
    date: t.date.toISOString(),
  }));

  // Calculate balances
  const allTransactions = await prisma.transaction.findMany({
    where: { category: { spaceId: space.id } },
    select: { amount: true, type: true, userId: true },
  });

  const memberBalances = members.map((member) => {
    const userTx = allTransactions.filter((t) => t.userId === member.id);
    const income = userTx
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = userTx
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      userId: member.id,
      name: member.name,
      income,
      expense,
      balance: income - expense,
    };
  });

  const combinedIncome = memberBalances.reduce(
    (sum, m) => sum + m.income,
    0
  );
  const combinedExpense = memberBalances.reduce(
    (sum, m) => sum + m.expense,
    0
  );

  return (
    <>
      <PinSetupBanner />
      <DashboardClient
        currentUserId={user.id}
        hasPartner={members.length > 1}
        members={memberBalances}
        combined={{
          income: combinedIncome,
          expense: combinedExpense,
          balance: combinedIncome - combinedExpense,
        }}
        recentTransactions={transactions}
        categories={categories}
      />
    </>
  );
}
