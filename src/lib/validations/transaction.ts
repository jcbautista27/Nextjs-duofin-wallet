import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z
    .number()
    .positive("El monto debe ser mayor a 0")
    .max(999999.99, "Monto demasiado alto"),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "El tipo debe ser INCOME o EXPENSE",
  }),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  date: z.string().min(1, "La fecha es obligatoria"),
  note: z.string().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
});

export const updateTransactionSchema = z.object({
  amount: z.coerce
    .number()
    .positive("El monto debe ser mayor a 0")
    .max(999999.99, "Monto demasiado alto")
    .optional(),
  categoryId: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  note: z.string().max(200).optional().or(z.literal("")),
});

export const transactionFiltersSchema = z.object({
  userId: z.string().optional(),
  categoryId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
