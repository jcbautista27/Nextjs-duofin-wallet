"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CreateSpaceButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createSpace() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/spaces", { method: "POST" });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "No se pudo crear el espacio");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={createSpace} disabled={loading}>
        {loading ? "Creando…" : "Crear mi espacio Duofin"}
      </Button>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <p className="text-muted-foreground max-w-xs text-center text-sm">
        Al crear tu espacio se generan las categorías predefinidas y podrás
        {" "}
        <Link href="/space" className="text-primary underline underline-offset-4">
          invitar a tu pareja
        </Link>
        .
      </p>
    </div>
  );
}
