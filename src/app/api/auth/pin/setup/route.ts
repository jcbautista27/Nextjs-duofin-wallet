import bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { ensureDeviceToken } from "@/lib/device";
import { prisma } from "@/lib/prisma";
import { hashDeviceToken } from "@/lib/device";
import { pinSchema } from "@/lib/validations/auth";

// Configura un PIN de 6 dígitos para el dispositivo actual.
// Requiere sesión autenticada (login completo previo).
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  const parsed = pinSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  // Genera o reutiliza el deviceToken de cookie para este dispositivo.
  const { token } = await ensureDeviceToken();
  const pinHash = await bcrypt.hash(parsed.data.pin, 10);

  await prisma.device.upsert({
    where: { deviceTokenHash: hashDeviceToken(token) },
    update: {
      userId: session.user.id,
      pinHash,
      pinEnabled: true,
      pinAttempts: 0,
      lastUsedAt: new Date(),
    },
    create: {
      deviceTokenHash: hashDeviceToken(token),
      userId: session.user.id,
      pinHash,
      pinEnabled: true,
    },
  });

  return Response.json({ ok: true });
}
