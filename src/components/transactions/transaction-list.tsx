"use client";

import { useCallback, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { TransactionForm } from "./transaction-form";

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
type SpaceUser = { id: string; name: string };

interface TransactionListProps {
  initialTransactions: Transaction[];
  categories: Category[];
  users: SpaceUser[];
  currentUserId: string;
}

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

export function TransactionList({
  initialTransactions,
  categories,
  users,
  currentUserId,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deletingError, setDeletingError] = useState<string | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    userId: "",
    categoryId: "",
    from: "",
    to: "",
  });

  const fetchTransactions = useCallback(
    async (f: typeof filters) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (f.userId) params.set("userId", f.userId);
      if (f.categoryId) params.set("categoryId", f.categoryId);
      if (f.from) params.set("from", f.from);
      if (f.to) params.set("to", f.to);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
      }
      setLoading(false);
    },
    []
  );

  function updateFilter(key: string, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    fetchTransactions(next);
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeletingError(null);
    setDeletingLoading(true);
    const res = await fetch(`/api/transactions/${deleting.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTransactions((prev) => prev.filter((t) => t.id !== deleting.id));
    } else {
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      setDeletingError(data?.error ?? "No se pudo eliminar la transacción");
    }
    setDeletingLoading(false);
    setDeleting(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap">
        <Select
          value={filters.userId}
          onChange={(e) => updateFilter("userId", e.target.value)}
          className="w-full lg:w-auto"
        >
          <option value="">Todos los usuarios</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>

        <Select
          value={filters.categoryId}
          onChange={(e) => updateFilter("categoryId", e.target.value)}
          className="w-full lg:w-auto"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <input
          type="date"
          value={filters.from}
          onChange={(e) => updateFilter("from", e.target.value)}
          className="border-input bg-background text-foreground h-9 w-full rounded-md border px-3 py-1 text-sm lg:w-auto"
          placeholder="Desde"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => updateFilter("to", e.target.value)}
          className="border-input bg-background text-foreground h-9 w-full rounded-md border px-3 py-1 text-sm lg:w-auto"
          placeholder="Hasta"
        />
      </div>

      {/* Transaction list */}
      {loading ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Cargando…
        </p>
      ) : transactions.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No hay transacciones registradas.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => {
            const isOwn = tx.user.id === currentUserId;
            return (
              <div
                key={tx.id}
                className="border-border flex items-center gap-3 rounded-lg border px-4 py-3"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {tx.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {tx.category.name}
                    {tx.note && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        — {tx.note}
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {tx.user.name} ·{" "}
                    {new Intl.DateTimeFormat("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(tx.date))}
                  </p>
                </div>
                <span
                  className={
                    tx.type === "INCOME"
                      ? "whitespace-nowrap font-mono text-sm font-medium text-emerald-600"
                      : "whitespace-nowrap font-mono text-sm font-medium text-rose-600"
                  }
                >
                  {formatMoney(tx.amount, tx.type)}
                </span>
                {isOwn && (
                  <div className="flex shrink-0 items-center gap-1">
                    <TransactionForm
                      categories={categories}
                      defaultValues={{
                        id: tx.id,
                        amount: Number(tx.amount),
                        type: tx.type,
                        categoryId: tx.category.id,
                        date: tx.date.split("T")[0],
                        note: tx.note ?? "",
                      }}
                      onSaved={() => fetchTransactions(filters)}
                      trigger={
                        <Button variant="ghost" size="icon" className="size-7">
                          <Pencil className="size-3.5" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive size-7"
                      onClick={() => setDeleting(tx)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog
        open={!!deleting}
        onOpenChange={(v) => {
          if (!v) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar transacción</DialogTitle>
            <DialogDescription>
              ¿Eliminar esta transacción de {deleting?.category.name}? Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deletingError && (
            <p className="text-destructive text-sm">{deletingError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingLoading}
            >
              {deletingLoading ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
