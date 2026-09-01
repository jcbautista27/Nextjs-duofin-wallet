import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

export const DEVICE_COOKIE = "duofin.deviceToken";
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

// Genera un token aleatorio largo (≥32 bytes) usado como identificador del
// dispositivo/navegador. Se guarda como cookie httpOnly, secure, sameSite=strict;
// nunca se expone a JavaScript del cliente.
export function generateDeviceToken(): string {
  return randomBytes(32).toString("hex");
}

// El schema guarda el hash del token (nunca el token crudo).
export function hashDeviceToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function deviceCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: DEVICE_COOKIE_MAX_AGE,
  };
}

export async function getDeviceToken(): Promise<string | undefined> {
  return (await cookies()).get(DEVICE_COOKIE)?.value;
}

// Devuelve el token existente o genera uno nuevo y lo persiste como cookie.
export async function ensureDeviceToken(): Promise<{
  token: string;
  created: boolean;
}> {
  const existing = await getDeviceToken();
  if (existing) return { token: existing, created: false };

  const token = generateDeviceToken();
  (await cookies()).set(DEVICE_COOKIE, token, deviceCookieOptions());
  return { token, created: true };
}
