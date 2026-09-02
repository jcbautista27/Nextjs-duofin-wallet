import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

// Devuelve true solo tras la hidratación en el cliente. Evita errores de
// hidratación cuando el render inicial del servidor difiere del cliente
// (p. ej. leer localStorage o preferencia del sistema).
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
