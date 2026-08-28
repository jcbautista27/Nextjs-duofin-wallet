import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { Avatar } from "@/components/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateSpaceButton } from "@/components/space/create-space-button";
import { InvitationActions } from "@/components/space/invitation-actions";
import { InviteForm } from "@/components/space/invite-form";
import { LeaveSpaceButton } from "@/components/space/leave-space-button";

export default async function SpacePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/login");

  const space = user.spaceId
    ? await prisma.space.findUnique({
        where: { id: user.spaceId },
        include: {
          users: { orderBy: { createdAt: "asc" } },
        },
      })
    : null;

  // Invitaciones pendientes dirigidas a mi email (solo si estoy sin espacio).
  const receivedInvitations = !space
    ? await prisma.invitation.findMany({
        where: {
          email: { equals: user.email, mode: "insensitive" },
          status: "PENDING",
          space: { status: "ACTIVE" },
        },
        include: {
          space: { include: { users: { orderBy: { createdAt: "asc" } } } },
          invitedBy: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const archived =
    space?.status === "ARCHIVED"
      ? space
      : null;

  const activeSpace = space?.status === "ACTIVE" ? space : null;
  const partner =
    activeSpace?.users.find((member) => member.id !== user.id) ??
    archived?.users.find((member) => member.id !== user.id);
  // Color por defecto: creador del espacio = jade, invitado = plum.
  const isCreator =
    activeSpace?.users[0]?.id === user.id ||
    archived?.users[0]?.id === user.id;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Tu espacio Duofin</h1>

      {receivedInvitations.length > 0 && (
        <section className="flex flex-col gap-3">
          {receivedInvitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                <p className="font-medium">
                  {invitation.invitedBy.name} te invitó a compartir finanzas
                </p>
                <div className="flex items-center gap-3">
                  <Avatar name={invitation.invitedBy.name} color="jade" />
                  <Avatar name={user.name} color="plum" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Al aceptar, ambos verán sus transacciones en una vista
                  combinada.
                </p>
                <InvitationActions invitationId={invitation.id} />
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {!space && receivedInvitations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <svg viewBox="0 0 64 40" className="h-10 w-16 opacity-60" aria-hidden={true}>
              <circle cx="22" cy="20" r="16" fill="#1F6F5C" opacity="0.85" />
              <circle cx="42" cy="20" r="16" fill="#7A3F5E" opacity="0.85" />
              <ellipse cx="32" cy="20" rx="6.5" ry="13" fill="#C9A227" />
            </svg>
            <p className="text-muted-foreground max-w-sm text-sm">
              Todavía no tienes un espacio de pareja. Crea uno para empezar a
              registrar ingresos y gastos en conjunto.
            </p>
            <CreateSpaceButton />
          </CardContent>
        </Card>
      )}

      {(activeSpace || archived) && user.spaceId && (
        <Card>
          <CardHeader className="items-center text-center">
            <CardTitle className="font-display">
              {archived
                ? "Espacio archivado (solo lectura)"
                : (activeSpace?.name ?? "Espacio Duofin")}
            </CardTitle>
            <CardDescription>
              {partner
                ? "Ustedes comparten este espacio financiero."
                : "Invita a tu pareja para ver el balance combinado."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-1">
                <Avatar
                  name={user.name}
                  color={isCreator ? "jade" : "plum"}
                  className="size-14"
                />
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-muted-foreground text-xs">Tú</span>
              </div>

              {partner ? (
                <div className="flex flex-col items-center gap-1">
                  <Avatar
                    name={partner.name}
                    color={isCreator ? "plum" : "jade"}
                    className="size-14"
                  />
                  <span className="text-sm font-medium">{partner.name}</span>
                  <span className="text-muted-foreground text-xs">Pareja</span>
                </div>
              ) : (
                !archived && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full border border-dashed text-xs">
                      +
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Sin pareja aún
                    </span>
                  </div>
                )
              )}
            </div>

            {activeSpace && !partner && (
              <div className="w-full max-w-sm">
                <InviteForm />
              </div>
            )}

            <LeaveSpaceButton hasPartner={!!partner} archived={!!archived} />

            {archived && (
              <p className="text-muted-foreground max-w-sm text-center text-xs">
                Puedes consultar tu historial individual desde{" "}
                <Link href="/" className="underline underline-offset-4">
                  Inicio
                </Link>{" "}
                mientras permanezcas en el espacio archivado.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
