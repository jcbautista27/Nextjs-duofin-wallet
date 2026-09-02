"use client";

import Link from "next/link";
import { LockIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useMounted } from "@/lib/use-mounted";

const DISMISS_KEY = "duofin.pinSetupBannerDismissed";

export function PinSetupBanner() {
  const mounted = useMounted();
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/pin")
      .then((res) => res.json())
      .then((data) => {
        setHasPin(data.hasPin ?? false);
        if (localStorage.getItem(DISMISS_KEY) === "1") {
          setDismissed(true);
        }
      })
      .catch(() => setHasPin(true));
  }, []);

  if (!mounted || dismissed || hasPin !== false) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="border bg-accent/50 mb-6 flex items-center gap-3 rounded-lg px-4 py-3 text-sm">
      <LockIcon className="text-primary shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Accede más rápido con un PIN</p>
        <p className="text-muted-foreground">
          Configura un PIN de 6 dígitos en este dispositivo para entrar sin
          escribir tu contraseña.
        </p>
      </div>
      <Link
        href="/settings"
        className="text-primary shrink-0 font-medium underline underline-offset-4"
      >
        Configurar
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Descartar"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
