import bcrypt from "bcryptjs";

import { hashDeviceToken } from "@/lib/device";
import { prisma } from "@/lib/prisma";

export const MAX_PIN_ATTEMPTS = 5;

export type PinVerifyResult =
  | {
      ok: true;
      user: {
        id: string;
        name: string | null;
        email: string;
        spaceId: string | null;
      };
    }
  | { ok: false; reason: "no_device" | "pin_disabled" | "blocked" | "invalid"; remainingAttempts?: number };

// Verifica el PIN contra el dispositivo identificado por el deviceToken.
// Sin un deviceToken válido, el PIN por sí solo nunca es suficiente (siempre falla).
// Bloquea el dispositivo tras 5 intentos fallidos (desactiva el PIN y exige login completo).
export async function verifyPinForDevice(
  token: string | undefined,
  pin: string
): Promise<PinVerifyResult> {
  if (!token) return { ok: false, reason: "no_device" };

  const device = await prisma.device.findUnique({
    where: { deviceTokenHash: hashDeviceToken(token) },
    include: { user: true },
  });

  if (!device) return { ok: false, reason: "no_device" };
  if (!device.pinEnabled || !device.pinHash) return { ok: false, reason: "pin_disabled" };
  if (device.pinAttempts >= MAX_PIN_ATTEMPTS) return { ok: false, reason: "blocked" };

  const matches = await bcrypt.compare(pin, device.pinHash);
  if (!matches) {
    const attempts = device.pinAttempts + 1;
    // Al alcanzar 5 fallos se desactiva el PIN: se exige login completo.
    const pinEnabled = attempts < MAX_PIN_ATTEMPTS ? device.pinEnabled : false;
    await prisma.device.update({
      where: { id: device.id },
      data: { pinAttempts: attempts, pinEnabled },
    });
    return {
      ok: false,
      reason: "invalid",
      remainingAttempts: Math.max(0, MAX_PIN_ATTEMPTS - attempts),
    };
  }

  await prisma.device.update({
    where: { id: device.id },
    data: { pinAttempts: 0, lastUsedAt: new Date() },
  });

  return { ok: true, user: device.user };
}

export const PIN_ERROR_MESSAGES: Record<string, string> = {
  no_device: "Esta sesión de PIN no es válida. Vuelve a iniciar sesión.",
  pin_disabled: "El PIN está desactivado en este dispositivo.",
  blocked: "Demasiados intentos fallidos. Usa tu contraseña para iniciar sesión.",
  invalid: "El PIN es incorrecto.",
};
