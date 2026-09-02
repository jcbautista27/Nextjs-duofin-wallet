"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PinDots } from "@/components/pin-dots";
import { PinPad } from "@/components/pin-pad";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PIN_LENGTH = 6;

export function PinSetupForm({
  onDone,
  onCancel,
}: {
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [first, setFirst] = useState("");
  const [current, setCurrent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function handleDigit(digit: string) {
    if (current.length >= PIN_LENGTH) return;
    setError(null);
    const next = current + digit;
    setCurrent(next);
    if (next.length === PIN_LENGTH) {
      if (step === 1) {
        setFirst(next);
        setCurrent("");
        setStep(2);
      } else {
        onSubmit(next);
      }
    }
  }

  function handleDelete() {
    setCurrent((c) => c.slice(0, -1));
  }

  async function onSubmit(pin: string) {
    if (pin !== first) {
      setError("Los PIN no coinciden. Inténtalo de nuevo.");
      setCurrent("");
      setStep(1);
      setFirst("");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/pin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo configurar el PIN.");
        setCurrent("");
        setStep(1);
        setFirst("");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
      setCurrent("");
    } finally {
      setLoading(false);
    }
  }

  function handleDone() {
    if (onDone) onDone();
    else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-xl">
          {done
            ? "PIN configurado"
            : step === 1
              ? "Elige tu PIN"
              : "Confirma tu PIN"}
        </CardTitle>
        <CardDescription>
          {done
            ? "Ya puedes usar tu PIN para acceder rápido en este dispositivo."
            : step === 1
              ? "Crea un PIN de 6 dígitos para acceder más rápido."
              : "Vuelve a ingresar el mismo PIN para confirmarlo."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {done ? (
          <Button onClick={handleDone} className="w-full">
            Continuar
          </Button>
        ) : (
          <>
            <PinDots value={current} length={PIN_LENGTH} />
            {error && <p className="text-destructive text-center text-sm">{error}</p>}
            <PinPad
              onDigit={handleDigit}
              onDelete={handleDelete}
              disabled={loading}
            />
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
