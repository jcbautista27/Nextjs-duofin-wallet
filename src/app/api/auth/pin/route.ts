import { auth } from "@/lib/auth";
import { getDeviceToken } from "@/lib/device";
import { hashDeviceToken } from "@/lib/device";
import { prisma } from "@/lib/prisma";

// Indica si el dispositivo actual tiene un PIN habilitado (para mostrar el
// login rápido por PIN en lugar del login normal).
export async function GET() {
  const token = await getDeviceToken();
  if (!token) {
    return Response.json({ hasPin: false });
  }

  const device = await prisma.device.findUnique({
    where: { deviceTokenHash: hashDeviceToken(token) },
    select: { pinEnabled: true },
  });

  return Response.json({ hasPin: device?.pinEnabled ?? false });
}

// Desactiva el PIN en el dispositivo actual (pinEnabled: false).
// Requiere sesión autenticada.
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = await getDeviceToken();
  if (!token) {
    return Response.json({ ok: true });
  }

  // Solo afecta al dispositivo actual del usuario autenticado.
  await prisma.device.updateMany({
    where: {
      deviceTokenHash: hashDeviceToken(token),
      userId: session.user.id,
    },
    data: { pinEnabled: false, pinAttempts: 0 },
  });

  return Response.json({ ok: true });
}
