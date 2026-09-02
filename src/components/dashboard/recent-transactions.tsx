"use client";

type Transaction = {
  id: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  note: string | null;
  category: { id: string; name: string; type: string };
  user: { id: string; name: string };
};

function formatMoney(amount: string, type: string) {
  const num = Number(amount);
  const prefix = type === "INCOME" ? "+" : "-";
  const formatted = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(num);
  return `${prefix} ${formatted}`;
}

export function RecentTransactions({
  transactions,
  currentUserId,
}: {
  transactions: Transaction[];
  currentUserId: string;
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        Sin transacciones recientes.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.slice(0, 5).map((tx) => {
        const isOwn = tx.user.id === currentUserId;
        return (
          <div
            key={tx.id}
            className="border-border flex items-center gap-3 rounded-lg border px-4 py-3"
          >
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white dark:text-background ${
                isOwn ? "bg-partner-jade" : "bg-partner-plum"
              }`}
            >
              {tx.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{tx.category.name}</p>
              <p className="text-muted-foreground text-xs">{tx.user.name}</p>
            </div>
            <span
              className={
                tx.type === "INCOME"
                  ? "whitespace-nowrap font-mono text-sm font-medium text-income tabular-nums"
                  : "whitespace-nowrap font-mono text-sm font-medium text-expense tabular-nums"
              }
            >
              {formatMoney(tx.amount, tx.type)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
