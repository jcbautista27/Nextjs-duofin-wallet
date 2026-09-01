import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  email: z.email("Ingresa un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.email("Ingresa un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const pinSchema = z.object({
  pin: z
    .string()
    .regex(/^\d{6}$/, "El PIN debe tener exactamente 6 dígitos"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PinInput = z.infer<typeof pinSchema>;
