"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function InvitationActions({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "reject") {
    setLoading(action);
    setError(null);

    const response = await fetch(
      action === "accept"
        ? "/api/spaces/invite/accept"
        : "/api/spaces/invite/reject",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      }
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "No se pudo completar la acción");
      setLoading(null);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <Button onClick={() => act("accept")} disabled={loading !== null}>
          {loading === "accept" ? "Aceptando…" : "Aceptar invitación"}
        </Button>
        <Button
          variant="outline"
          onClick={() => act("reject")}
          disabled={loading !== null}
        >
          Rechazar
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
