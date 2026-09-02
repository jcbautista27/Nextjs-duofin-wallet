import { auth } from "@/lib/auth";
import { getDeviceToken } from "@/lib/device";
import { hashDeviceToken } from "@/lib/device";
import { prisma } from "@/lib/prisma";
import { PinSettingsCard } from "@/components/pin-settings-card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const token = await getDeviceToken();

  let pinEnabled = false;
  if (session?.user?.id && token) {
    const device = await prisma.device.findFirst({
      where: {
        deviceTokenHash: hashDeviceToken(token),
        userId: session.user.id,
      },
      select: { pinEnabled: true },
    });
    pinEnabled = device?.pinEnabled ?? false;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Configuración</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Personaliza tu experiencia y tu acceso rápido.
        </p>
      </div>

      <PinSettingsCard pinEnabled={pinEnabled} />
    </div>
  );
}
