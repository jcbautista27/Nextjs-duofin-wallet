"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/lib/validations/category";

type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  isDefault: boolean;
  createdById: string | null;
};

interface CategoryManagerProps {
  categories: Category[];
  userId: string;
}

export function CategoryManager({
  categories: initial,
  userId,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deletingError, setDeletingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "", type: "EXPENSE" },
  });

  const refreshCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
  }, []);

  async function handleCreate(values: CreateCategoryInput) {
    setServerError(null);
    setSubmitting(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setServerError(data?.error ?? "No se pudo crear la categoría");
      setSubmitting(false);
      return;
    }

    setDialogOpen(false);
    setSubmitting(false);
    await refreshCategories();
  }

  async function handleEdit() {
    if (!editing) return;
    setServerError(null);
    setSubmitting(true);
    const values = form.getValues();
    const res = await fetch(`/api/categories/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name.trim() }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setServerError(data?.error ?? "No se pudo editar la categoría");
      setSubmitting(false);
      return;
    }

    setEditing(null);
    setSubmitting(false);
    await refreshCategories();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeletingError(null);
    setDeletingLoading(true);
    const res = await fetch(`/api/categories/${deleting.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setDeletingError(data?.error ?? "No se pudo eliminar la categoría");
      setDeletingLoading(false);
      return;
    }

    setDeleting(null);
    setDeletingLoading(false);
    await refreshCategories();
  }

  const expenses = categories.filter((c) => c.type === "EXPENSE");
  const incomes = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Gastos</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            form.reset({ name: "", type: "EXPENSE" });
            setServerError(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 size-4" />
          Categoría
        </Button>
      </div>

      <CategoryList
        items={expenses}
        userId={userId}
        onEdit={(cat) => {
          setEditing(cat);
          form.reset({ name: cat.name, type: cat.type });
          setServerError(null);
          setDialogOpen(true);
        }}
        onDelete={setDeleting}
      />

      <h2 className="font-display text-lg font-semibold">Ingresos</h2>
      <CategoryList
        items={incomes}
        userId={userId}
        onEdit={(cat) => {
          setEditing(cat);
          form.reset({ name: cat.name, type: cat.type });
          setServerError(null);
          setDialogOpen(true);
        }}
        onDelete={setDeleting}
      />

      {categories.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Aún no hay categorías. Crea una para empezar.
        </p>
      )}

      {/* Create / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
          setDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Cambia el nombre de la categoría."
                : "Agrega una categoría personalizada a tu espacio."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(editing ? handleEdit : handleCreate)}
              className="grid gap-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Mascotas, Gimnasio..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!editing && (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            field.value === "EXPENSE" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => field.onChange("EXPENSE")}
                        >
                          Gasto
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === "INCOME" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => field.onChange("INCOME")}
                        >
                          Ingreso
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {serverError && (
                <p className="text-destructive text-sm">{serverError}</p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Guardando…"
                    : editing
                      ? "Guardar"
                      : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar &ldquo;{deleting?.name}
              &rdquo;? Esta acción no se puede deshacer.
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

function CategoryList({
  items,
  userId,
  onEdit,
  onDelete,
}: {
  items: Category[];
  userId: string;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No hay categorías de este tipo.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((cat) => (
        <div
          key={cat.id}
          className="border-border flex flex-wrap items-center justify-between gap-2 rounded-full border px-4 py-2"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-sm font-medium">{cat.name}</span>
            {cat.isDefault && (
              <span className="text-muted-foreground text-xs">
                predefinida
              </span>
            )}
          </div>
          {!cat.isDefault && cat.createdById === userId && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onEdit(cat)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive size-7"
                onClick={() => onDelete(cat)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
