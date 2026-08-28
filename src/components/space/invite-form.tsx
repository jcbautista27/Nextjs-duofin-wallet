"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteForm({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/spaces/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "No se pudo enviar la invitación");
      setLoading(false);
      return;
    }

    setSuccess(`Invitación enviada a ${email}`);
    setEmail("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="invite-email" className="text-sm font-medium">
        Invitar a mi pareja por correo
      </label>
      <div className="flex gap-2">
        <Input
          id="invite-email"
          type="email"
          placeholder="email@de-mi-pareja.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={disabled || loading}
        />
        <Button type="submit" disabled={disabled || loading}>
          {loading ? "Enviando…" : "Invitar"}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {success && <p className="text-income text-sm">{success}</p>}
    </form>
  );
}
