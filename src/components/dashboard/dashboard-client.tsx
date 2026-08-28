"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BalanceCard, OverlapVisual } from "./balance-card";
import { ViewToggle } from "./view-toggle";
import { RecentTransactions } from "./recent-transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";

type MemberBalance = {
  userId: string;
  name: string;
  income: number;
  expense: number;
  balance: number;
};

type Transaction = {
  id: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  date: string;
  note: string | null;
  category: { id: string; name: string; type: string };
  user: { id: string; name: string };
};

type Category = { id: string; name: string; type: string };

interface DashboardClientProps {
  currentUserId: string;
  hasPartner: boolean;
  members: MemberBalance[];
  combined: { income: number; expense: number; balance: number };
  recentTransactions: Transaction[];
  categories: Category[];
}

export function DashboardClient({
  currentUserId,
  hasPartner,
  members,
  combined,
  recentTransactions,
  categories,
}: DashboardClientProps) {
  const [view, setView] = useState<"mine" | "partner" | "combined">("mine");

  const myMember = members.find((m) => m.userId === currentUserId);
  const partnerMember = members.find((m) => m.userId !== currentUserId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold">Mi balance</h1>
        <ViewToggle current={view} onChange={setView} hasPartner={hasPartner} />
      </div>

      {/* Balance cards */}
      {view === "mine" && myMember && (
        <BalanceCard
          label="Mi balance"
          income={myMember.income}
          expense={myMember.expense}
          balance={myMember.balance}
          color="jade"
        />
      )}

      {view === "partner" && partnerMember && (
        <BalanceCard
          label={`Balance de ${partnerMember.name}`}
          income={partnerMember.income}
          expense={partnerMember.expense}
          balance={partnerMember.balance}
          color="plum"
        />
      )}

      {view === "combined" && (
        <>
          <BalanceCard
            label="Balance combinado"
            income={combined.income}
            expense={combined.expense}
            balance={combined.balance}
            color="gold"
          />
          {hasPartner && myMember && partnerMember && (
            <OverlapVisual
              myBalance={myMember.balance}
              partnerBalance={partnerMember.balance}
              combinedBalance={combined.balance}
            />
          )}
        </>
      )}

      {/* Recent transactions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-semibold">
          Últimas transacciones
        </h2>
        <div className="self-start">
          <TransactionForm categories={categories} />
        </div>
      </div>

      <RecentTransactions
        transactions={recentTransactions}
        currentUserId={currentUserId}
      />

      {recentTransactions.length > 0 && (
        <Button asChild variant="outline" className="w-full">
          <Link href="/transactions">Ver todas</Link>
        </Button>
      )}
    </div>
  );
}
