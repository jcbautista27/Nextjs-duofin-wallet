import { z } from "zod";

export const inviteSchema = z.object({
  email: z.email("Ingresa un email válido"),
});

export const acceptInviteSchema = z.object({
  invitationId: z.string().min(1, "Falta el identificador de la invitación"),
});
