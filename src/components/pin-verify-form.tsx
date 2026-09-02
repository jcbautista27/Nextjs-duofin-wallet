"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { PinDots } from "@/components/pin-dots";
import { PinPad } from "@/components/pin-pad";
import { Button } from "@/components/ui/button";

const PIN_LENGTH = 6;

export function PinVerifyForm({
  onUsePassword,
}: {
  onUsePassword: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [current, setCurrent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleDigit(digit: string) {
    if (current.length >= PIN_LENGTH || loading) return;
    setError(null);
    const next = current + digit;
    setCurrent(next);
    if (next.length === PIN_LENGTH) {
      onSubmit(next);
    }
  }

  function handleDelete() {
    if (loading) return;
    setError(null);
    setCurrent((c) => c.slice(0, -1));
  }

  async function onSubmit(pin: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/pin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "PIN incorrecto.");
        setCurrent("");
        return;
      }
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/");
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
      setCurrent("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid justify-items-center gap-6">
      <PinDots value={current} length={PIN_LENGTH} />
      {error && <p className="text-destructive text-center text-sm">{error}</p>}
      <PinPad onDigit={handleDigit} onDelete={handleDelete} disabled={loading} />
      <Button type="button" variant="ghost" onClick={onUsePassword}>
        Usar contraseña en su lugar
      </Button>
    </div>
  );
}
