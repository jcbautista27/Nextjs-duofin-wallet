"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PinSetupForm } from "@/components/pin-setup-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PinSettingsCard({ pinEnabled }: { pinEnabled: boolean }) {
  const router = useRouter();
  const [showSetup, setShowSetup] = useState(false);
  const [status, setStatus] = useState(pinEnabled);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  async function disablePin() {
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/pin", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo desactivar el PIN.");
        return;
      }
      setStatus(false);
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setWorking(false);
    }
  }

  if (showSetup) {
    return (
      <PinSetupForm
        onCancel={() => setShowSetup(false)}
        onDone={() => {
          setShowSetup(false);
          setStatus(true);
          router.refresh();
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Acceso rápido con PIN</CardTitle>
        <CardDescription>
          Inicia sesión en este dispositivo sin escribir tu contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          {status
            ? "El PIN está activado para este dispositivo."
            : "No hay un PIN configurado en este dispositivo."}
        </p>
        {error && <p className="text-destructive text-sm">{error}</p>}
        {status ? (
          <Button
            variant="outline"
            onClick={disablePin}
            disabled={working}
            className="justify-self-start"
          >
            {working ? "Desactivando…" : "Desactivar PIN"}
          </Button>
        ) : (
          <Button onClick={() => setShowSetup(true)} className="justify-self-start">
            Configurar PIN
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
