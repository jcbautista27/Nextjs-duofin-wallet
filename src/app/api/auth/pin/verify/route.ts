import { signIn } from "@/lib/auth";
import { getDeviceToken } from "@/lib/device";
import {
  PIN_ERROR_MESSAGES,
  verifyPinForDevice,
} from "@/lib/pin";
import { pinSchema } from "@/lib/validations/auth";

// Inicio de sesión rápida con el PIN del dispositivo (cookie deviceToken) +
// el PIN recibido. Si ambos son válidos, emite una sesión.
export async function POST(request: Request) {
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

  const token = await getDeviceToken();
  const result = await verifyPinForDevice(token, parsed.data.pin);

  if (!result.ok) {
    return Response.json(
      {
        error: PIN_ERROR_MESSAGES[result.reason],
        reason: result.reason,
        remainingAttempts: result.remainingAttempts,
      },
      { status: result.reason === "invalid" ? 401 : 403 }
    );
  }

  // Emite la sesión reutilizando el provider Credentials en modo "pin".
  // authorize vuelve a verificar el deviceToken + PIN sobre el mismo pedido.
  try {
    await signIn("credentials", {
      mode: "pin",
      pin: parsed.data.pin,
      redirect: false,
    });
  } catch (error) {
    console.error("Error al emitir sesión por PIN:", error);
    return Response.json({ error: "No se pudo iniciar sesión" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
