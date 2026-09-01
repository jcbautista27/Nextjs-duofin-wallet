import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema, pinSchema } from "@/lib/validations/auth";
import { DEVICE_COOKIE } from "@/lib/device";
import { verifyPinForDevice } from "@/lib/pin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        mode: {},
        pin: {},
      },
      async authorize(credentials, request) {
        // Login rápido con PIN: verifica el PIN del dispositivo contra el
        // deviceToken (cookie httpOnly). Sin deviceToken válido siempre falla.
        if (credentials?.mode === "pin") {
          const parsed = pinSchema.safeParse({ pin: credentials.pin });
          if (!parsed.success) return null;

          // NextAuth inyecta las cookies del pedido en el objeto Request.
          // Las tipan exactas no lo exponen, así que se lee de forma segura.
          const requestWithCookies = request as Request & {
            cookies?: { get?: (name: string) => { value: string } | undefined };
          };
          let token: string | undefined;
          if (typeof requestWithCookies.cookies?.get === "function") {
            token = requestWithCookies.cookies.get(DEVICE_COOKIE)?.value;
          }
          if (!token) {
            const cookieHeader = request?.headers?.get("cookie") ?? "";
            token = cookieHeader
              .split(";")
              .map((c) => c.trim())
              .find((c) => c.startsWith(`${DEVICE_COOKIE}=`))
              ?.slice(DEVICE_COOKIE.length + 1);
          }

          const result = await verifyPinForDevice(token, parsed.data.pin);
          if (!result.ok) return null;

          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            spaceId: result.user.spaceId,
          };
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!passwordMatches) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          spaceId: user.spaceId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.spaceId = user.spaceId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.spaceId = token.spaceId ?? null;
      return session;
    },
  },
});
