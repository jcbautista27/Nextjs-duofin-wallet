# Propuesta de cambio — Navegación responsive, favicon/tema, y actualización en tiempo real

**Fecha:** 2026-09-13
**Estado:** Aprobada
**Impacto:** Especificaciones Funcionales, Especificaciones Técnicas, Sistema de Diseño, Wireframes, Backlog (2 fases nuevas)

---

## 1. Navegación responsive (bugfix de UX en mobile)

**Síntoma:** en pantallas móviles, el menú de navegación no muestra todas las opciones (se desbordan).

**Solución aprobada:** patrón *bottom tab bar* en mobile con 5 ítems fijos (Inicio, Historial, **+** Nueva transacción destacado, Reportes, Más) y un panel "Más" para las opciones secundarias (Categorías, Espacio de pareja, Notificaciones, Configuración, Cerrar sesión). En desktop se mantiene la navegación horizontal actual. Mockup validado con el usuario.

## 2. Favicon con el logo de la app + botón de tema solo-ícono

- El favicon del navegador usa el motivo "traslape" (círculos jade + ciruela) ya definido como logo de Duofin.
- El botón de cambio de tema (claro/oscuro/sistema) se reduce a un botón cuadrado de solo ícono (sin texto), que cicla entre los 3 estados. Mockup validado con el usuario.

## 3. Actualización en tiempo real de datos (bugfix)

**Síntoma:** al registrar una transacción, no aparece en el historial hasta recargar el navegador manualmente.

**Causa raíz:** las pantallas obtienen datos una sola vez al cargar, sin invalidar/refrescar el caché tras un `POST`/`PUT`/`DELETE`.

**Solución aprobada:** adoptar **SWR** como capa de datos en cliente para todas las pantallas que muestran datos (historial, dashboard, reportes, notificaciones). Tras cada mutación exitosa, se invalida (`mutate()`) la(s) clave(s) afectada(s), refrescando automáticamente todas las vistas abiertas. Incluye actualización optimista para que la transacción aparezca al instante, antes de la confirmación del servidor.

---

## 4. Decisión

Las 3 mejoras se aprueban. Se agregan como **Fase 12** (navegación responsive + favicon + tema) y **Fase 13** (actualización en tiempo real con SWR) del backlog.
