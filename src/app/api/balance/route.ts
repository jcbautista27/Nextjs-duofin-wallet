import { prisma } from "@/lib/prisma";
import { apiErrorResponse, requireActiveSpace } from "@/lib/api";

export async function GET() {
  try {
    const { space } = await requireActiveSpace();

    const members = await prisma.user.findMany({
      where: { spaceId: space.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });

    const transactions = await prisma.transaction.findMany({
      where: { category: { spaceId: space.id } },
      select: {
        amount: true,
        type: true,
        userId: true,
      },
    });

    const memberBalances = members.map((member) => {
      const userTx = transactions.filter((t) => t.userId === member.id);
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

    return Response.json({
      members: memberBalances,
      combined: {
        income: combinedIncome,
        expense: combinedExpense,
        balance: combinedIncome - combinedExpense,
      },
    });
  } catch (error) {
    return (
      apiErrorResponse(error) ??
      Response.json({ error: "Error interno" }, { status: 500 })
    );
  }
}
