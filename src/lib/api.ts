import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Space, User } from "@/generated/prisma/client";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function apiErrorResponse(error: unknown): Response | null {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Error interno en API:", error);
  return Response.json(
    { error: "Error interno del servidor" },
    { status: 500 }
  );
}

/** Devuelve el usuario autenticado o lanza 401. */
export async function requireUser(): Promise<User> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "No autenticado");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    throw new ApiError(401, "No autenticado");
  }
  return user;
}

/**
 * Devuelve el usuario y su espacio ACTIVO, o lanza:
 * - 404 si el usuario no pertenece a ningún espacio.
 * - 409 si su espacio está archivado (solo lectura).
 */
export async function requireActiveSpace(): Promise<{
  user: User;
  space: Space;
}> {
  const user = await requireUser();

  if (!user.spaceId) {
    throw new ApiError(404, "No perteneces a ningún espacio de pareja");
  }

  const space = await prisma.space.findUnique({
    where: { id: user.spaceId },
  });
  if (!space) {
    throw new ApiError(404, "No perteneces a ningún espacio de pareja");
  }
  if (space.status !== "ACTIVE") {
    throw new ApiError(
      409,
      "El espacio está archivado: solo lectura. Desvincúrate para crear uno nuevo."
    );
  }

  return { user, space };
}
