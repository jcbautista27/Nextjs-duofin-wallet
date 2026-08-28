"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LeaveSpaceButton({
  hasPartner,
  archived,
}: {
  hasPartner: boolean;
  archived?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leave() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/spaces/leave", { method: "POST" });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "No se pudo desvincular el espacio");
      setLoading(false);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          {archived ? "Salir del espacio archivado" : "Desvincular espacio"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">
            ¿Desvincular tu espacio Duofin?
          </DialogTitle>
          <DialogDescription>
            El espacio se archivará: no se eliminarán los datos, pero solo
            podrás consultarlos y no habrá nuevos registros conjuntos.
            {hasPartner
              ? " Tu pareja conservará acceso de lectura al histórico."
              : ""}
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={leave} disabled={loading}>
            {loading ? "Desvinculando…" : "Sí, desvincular"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
