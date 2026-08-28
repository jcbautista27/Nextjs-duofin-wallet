import { NextResponse, type NextRequest } from "next/server";

// Verificación optimista de sesión (presencia de la cookie JWT de Auth.js).
// La validación criptográfica real ocurre en server components / API routes
// vía auth() — el proxy solo evita cargar páginas privadas sin sesión.
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIES.some((name) =>
    request.cookies.has(name)
  );

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/transactions/:path*", "/categories/:path*", "/space/:path*"],
};
