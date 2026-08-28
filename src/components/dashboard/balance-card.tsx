"use client";

interface BalanceCardProps {
  label: string;
  income: number;
  expense: number;
  balance: number;
  color?: "jade" | "plum" | "gold";
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(n);
}

export function BalanceCard({
  label,
  income,
  expense,
  balance,
  color = "gold",
}: BalanceCardProps) {
  const colorClasses = {
    jade: "bg-partner-jade-bg border-partner-jade/20",
    plum: "bg-partner-plum-bg border-partner-plum/20",
    gold: "bg-primary/5 border-primary/20",
  };

  const amountColor =
    balance >= 0 ? "text-income" : "text-expense";

  return (
    <div
      className={`rounded-xl border p-4 ${colorClasses[color]}`}
    >
      <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`font-mono text-3xl font-medium tabular-nums ${amountColor}`}
      >
        {formatMoney(balance)}
      </p>
      <div className="mt-2 flex gap-4 text-xs">
        <span className="text-income">
          + {formatMoney(income)}
        </span>
        <span className="text-expense">
          - {formatMoney(expense)}
        </span>
      </div>
    </div>
  );
}

export function OverlapVisual({
  myBalance,
  partnerBalance,
  combinedBalance,
}: {
  myBalance: number;
  partnerBalance: number;
  combinedBalance: number;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="relative h-28 w-full max-w-[16rem]">
        {/* Jade circle */}
        <div className="absolute left-4 top-0 flex size-24 items-center justify-center rounded-full bg-partner-jade/20">
          <span className="font-mono text-sm font-medium text-partner-jade tabular-nums">
            {formatMoney(myBalance)}
          </span>
        </div>
        {/* Plum circle */}
        <div className="absolute right-4 top-0 flex size-24 items-center justify-center rounded-full bg-partner-plum/20">
          <span className="font-mono text-sm font-medium text-partner-plum tabular-nums">
            {formatMoney(partnerBalance)}
          </span>
        </div>
        {/* Gold intersection badge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
          <span className="font-mono text-xs font-medium text-primary tabular-nums">
            {formatMoney(combinedBalance)}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground mt-6 text-xs">Balance combinado</p>
    </div>
  );
}
