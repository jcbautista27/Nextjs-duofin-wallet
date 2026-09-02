"use client";

import { DeleteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function PinPad({
  onDigit,
  onDelete,
  disabled = false,
}: {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid w-full max-w-[220px] grid-cols-3 gap-2" aria-label="Teclado numérico">
      {KEYS.map((key) => (
        <Button
          key={key}
          type="button"
          variant="outline"
          size="lg"
          className="h-14 text-xl"
          disabled={disabled}
          onClick={() => onDigit(key)}
          aria-label={key}
        >
          {key}
        </Button>
      ))}
      <div />
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-14 text-xl"
        disabled={disabled}
        onClick={() => onDigit("0")}
        aria-label="0"
      >
        0
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="h-14"
        disabled={disabled}
        onClick={onDelete}
        aria-label="Borrar"
      >
        <DeleteIcon />
      </Button>
    </div>
  );
}
