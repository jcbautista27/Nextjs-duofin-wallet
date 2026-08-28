"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/lib/validations/transaction";

type Category = { id: string; name: string; type: string };

interface TransactionFormProps {
  categories: Category[];
  defaultValues?: {
    id?: string;
    amount?: number;
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    date?: string;
    note?: string;
  };
  onSaved?: () => void;
  trigger?: React.ReactNode;
}

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

export function TransactionForm({
  categories,
  defaultValues,
  onSaved,
  trigger,
}: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!defaultValues?.id;

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: defaultValues?.amount ?? 0,
      type: (defaultValues?.type ?? "EXPENSE") as "INCOME" | "EXPENSE",
      categoryId: defaultValues?.categoryId ?? "",
      date: defaultValues?.date ?? toDateString(new Date()),
      note: defaultValues?.note ?? "",
    },
  });

  const selectedType = form.watch("type");
  const filteredCategories = categories.filter(
    (c) => c.type === selectedType
  );

  async function onSubmit(values: CreateTransactionInput) {
    setServerError(null);

    const url = isEditing
      ? `/api/transactions/${defaultValues!.id}`
      : "/api/transactions";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        amount: Number(values.amount),
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      setServerError(data?.error ?? "No se pudo guardar la transacción");
      return;
    }

    setOpen(false);
    form.reset({
      amount: 0,
      type: "EXPENSE",
      categoryId: "",
      date: toDateString(new Date()),
      note: "",
    });
    onSaved?.();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setServerError(null);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-1 size-4" />
            Nueva transacción
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar transacción" : "Nueva transacción"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la transacción."
              : "Registra un ingreso o gasto en tu espacio."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={field.value === "EXPENSE" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        field.onChange("EXPENSE");
                        form.setValue("categoryId", "");
                      }}
                    >
                      Gasto
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "INCOME" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        field.onChange("INCOME");
                        form.setValue("categoryId", "");
                      }}
                    >
                      Ingreso
                    </Button>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto (S/)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={field.value as number}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="">Seleccionar...</option>
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descripción breve..."
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-destructive text-sm">{serverError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : isEditing
                    ? "Guardar"
                    : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
