# Backlog de Desarrollo — Duofin

**Versión:** 1.1 (MVP + mejoras post-lanzamiento)
**Documentos base:** Duofin_Especificaciones_Funcionales.md, Duofin_Especificaciones_Tecnicas.md
**Propósito:** Lista secuencial y accionable de tareas para que un agente de código (ej. OpenCode) construya la app paso a paso, respetando dependencias.

**Cómo usar este documento:** cada tarea debe completarse y verificarse (criterio de aceptación) antes de pasar a la siguiente, salvo que se indique que pueden hacerse en paralelo.

---

## Fase 0 — Setup del proyecto

- [ ] **0.1** Inicializar proyecto Next.js 14+ (App Router) con TypeScript.
  - *Aceptación:* `pnpm dev` levanta el proyecto sin errores.
- [ ] **0.2** Configurar Tailwind CSS.
  - *Aceptación:* clases de Tailwind se aplican correctamente en una página de prueba.
- [ ] **0.3** Instalar y configurar shadcn/ui (init + componentes base: Button, Input, Card, Dialog, Form).
  - *Aceptación:* un componente shadcn (ej. Button) se renderiza correctamente.
- [ ] **0.4** Crear estructura de carpetas según especificaciones técnicas (sección 5).
  - *Aceptación:* carpetas `app/(auth)`, `app/(dashboard)`, `app/api`, `components`, `lib`, `types` existen.
- [ ] **0.5** Configurar `.env.example` con variables necesarias (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).

---

## Fase 1 — Base de datos y modelo de datos

*Depende de: Fase 0*

- [ ] **1.1** Crear base de datos PostgreSQL (Neon o Supabase) y obtener `DATABASE_URL` (si es Supabase, también `DIRECT_URL` — ver especificaciones técnicas, sección 1). *Esta tarea es manual, la realiza la persona, no el agente.*
- [ ] **1.2** Instalar y configurar Prisma (`prisma init`).
- [ ] **1.3** Definir `schema.prisma` completo según especificaciones técnicas (sección 3): modelos `User`, `Space`, `Invitation`, `Category`, `Transaction` + enums.
  - *Aceptación:* `prisma validate` pasa sin errores.
- [ ] **1.4** Ejecutar primera migración (`prisma migrate dev`).
  - *Aceptación:* tablas creadas correctamente en la base de datos.
- [ ] **1.5** Crear script de seed (`prisma/seed.ts`) con categorías predefinidas (Vivienda, Alimentación, Transporte, Salud, Entretenimiento, Ingresos - Sueldo, Ingresos - Otros, etc.).
  - *Nota:* estas categorías se asocian a cada `Space` nuevo, no de forma global. Definir si el seed las crea al momento de crear el `Space` (recomendado) en vez de precargarlas sueltas.
- [ ] **1.6** Configurar cliente Prisma singleton en `lib/prisma.ts`.

---

## Fase 2 — Autenticación

*Depende de: Fase 1*

- [ ] **2.1** Instalar y configurar NextAuth.js con proveedor de Credentials (email + password).
- [ ] **2.2** Implementar hash de contraseñas con bcrypt.
- [ ] **2.3** Crear endpoint `POST /api/auth/register` (validación con Zod: nombre, email, password).
  - *Aceptación:* un usuario nuevo se crea en la BD con `passwordHash`.
- [ ] **2.4** Configurar `/api/auth/[...nextauth]` para login con Credentials.
  - *Aceptación:* login exitoso genera sesión JWT válida.
- [ ] **2.5** Construir UI de registro (`app/(auth)/register`) con shadcn Form.
- [ ] **2.6** Construir UI de login (`app/(auth)/login`) con shadcn Form.
- [ ] **2.7** Middleware de protección de rutas: redirigir a `/login` si no hay sesión activa en rutas de `(dashboard)`.
  - *Aceptación:* usuario no autenticado no puede acceder a `/dashboard`, `/transactions`, etc.

---

## Fase 3 — Espacio de pareja (Space)

*Depende de: Fase 2*

- [ ] **3.1** Endpoint `POST /api/spaces`: crear `Space` (con categorías predefinidas vía seed) y asociar al usuario que lo crea como `spaceId`.
  - *Aceptación:* al crear el espacio, el usuario queda vinculado y las categorías predefinidas existen para ese `Space`.
- [ ] **3.2** Endpoint `POST /api/spaces/invite`: crear `Invitation` (status `PENDING`) asociada al `Space` y al email invitado.
- [ ] **3.3** Endpoint `POST /api/spaces/invite/accept`: valida invitación, asocia el `spaceId` al usuario invitado, marca invitación como `ACCEPTED`.
  - *Aceptación:* ambos usuarios comparten el mismo `spaceId` tras aceptar.
  - *Regla de negocio:* si el usuario invitado ya pertenece a otro `Space` activo, debe salir de él primero (ver 3.4) antes de aceptar.
- [ ] **3.4** Endpoint `POST /api/spaces/leave`: marca el `Space` como `ARCHIVED` (no se elimina), pero mantiene el acceso de solo lectura a los datos históricos.
  - *Aceptación:* transacciones y categorías del `Space` archivado siguen siendo consultables (`GET`), pero no se pueden crear nuevas.
- [ ] **3.5** UI de gestión de espacio (`app/(dashboard)/space`): crear espacio, invitar pareja, ver estado de invitación, opción de desvincularse.

---

## Fase 4 — Categorías

*Depende de: Fase 3*

- [ ] **4.1** Endpoint `GET /api/categories`: lista categorías del `Space` del usuario autenticado (predefinidas + personalizadas).
- [ ] **4.2** Endpoint `POST /api/categories`: crear categoría personalizada (queda asociada al `Space`, visible para ambos).
- [ ] **4.3** Endpoint `PUT /api/categories/:id` y `DELETE /api/categories/:id`: solo permitido si `isDefault: false` y el usuario pertenece al `Space` de la categoría.
  - *Aceptación:* no se pueden editar/eliminar categorías predefinidas (`isDefault: true`).
- [ ] **4.4** UI de gestión de categorías (`app/(dashboard)/categories`): listado, crear, editar, eliminar.

---

## Fase 5 — Transacciones

*Depende de: Fase 4*

- [ ] **5.1** Endpoint `POST /api/transactions`: crear transacción (monto, tipo, categoría, fecha, nota opcional), asociada al usuario autenticado.
  - *Validación:* la categoría debe pertenecer al mismo `Space` del usuario.
- [ ] **5.2** Endpoint `GET /api/transactions`: listar transacciones del `Space`, con filtros por usuario, categoría y rango de fechas.
- [ ] **5.3** Endpoint `PUT /api/transactions/:id`: editar, solo si la transacción pertenece al usuario autenticado.
- [ ] **5.4** Endpoint `DELETE /api/transactions/:id`: eliminar, solo si pertenece al usuario autenticado.
- [ ] **5.5** UI de formulario de nueva transacción (Dialog/Sheet con shadcn: monto, tipo, categoría, fecha, nota).
- [ ] **5.6** UI de listado/historial de transacciones con filtros (usuario, categoría, fecha).

---

## Fase 6 — Balance y dashboard

*Depende de: Fase 5*

- [ ] **6.1** Endpoint `GET /api/balance`: calcula balance individual (por usuario) y combinado (suma de ingresos - gastos del `Space`).
- [ ] **6.2** UI de dashboard (`app/(dashboard)/page.tsx`): tarjetas de balance individual, balance de la pareja, y balance combinado.
- [ ] **6.3** Alternador de vista "Mía" / "De mi pareja" / "Combinada" en el dashboard.

---

## Fase 7 — Notificaciones

*Depende de: Fase 5 (puede desarrollarse en paralelo a Fase 6)*

- [ ] **7.1** Al crear una transacción (endpoint 5.1), generar un registro en `Notification` para el otro miembro del `Space`.
- [ ] **7.2** Endpoint `GET /api/notifications`: listar notificaciones del usuario autenticado (leídas/no leídas).
- [ ] **7.3** Endpoint `PUT /api/notifications/:id/read`: marcar notificación como leída.
- [ ] **7.4** UI de notificaciones (ícono de campana con contador, dropdown con listado) en el layout del dashboard.

---

## Fase 8 — Pulido y despliegue

*Depende de: todas las fases anteriores*

- [ ] **8.1** Revisión de responsividad (mobile/desktop) en todas las pantallas.
- [ ] **8.2** Manejo de estados de carga y error en formularios y listados.
- [ ] **8.3** Configurar proyecto en Vercel, conectar variables de entorno de producción.
- [ ] **8.4** Ejecutar migraciones en base de datos de producción (Neon/Supabase).
- [ ] **8.5** Prueba end-to-end del flujo completo: registro → crear espacio → invitar pareja → aceptar → registrar transacciones (ambos usuarios) → revisar balance combinado → recibir notificación.

---

## Fase 9 — Login rápido con PIN + Modo oscuro

*Depende de: Fase 8 (app ya desplegada y funcionando). Origen: `docs/changes/2026-08-30_pin-login-y-modo-oscuro.md`.*

### PIN de acceso rápido
- [ ] **9.1** Actualizar `schema.prisma`: agregar modelo `Device` (ver especificaciones técnicas, sección 3) y correr migración.
- [ ] **9.2** Endpoint `POST /api/auth/pin/setup`: genera `deviceToken` (cookie httpOnly), hashea el PIN con bcrypt, crea/actualiza el registro `Device`.
  - *Aceptación:* solo accesible con sesión autenticada activa (login completo previo).
- [ ] **9.3** Endpoint `POST /api/auth/pin/verify`: valida `deviceToken` (cookie) + PIN recibido contra `pinHash`; si coincide, emite sesión.
  - *Aceptación:* rechaza si no hay `deviceToken` válido, aunque el PIN sea correcto. Bloquea tras 5 intentos fallidos.
- [ ] **9.4** Endpoint `DELETE /api/auth/pin`: desactiva el PIN (`pinEnabled: false`) para el dispositivo actual.
- [ ] **9.5** UI "Configurar PIN" (pantalla 6.6 del sistema de diseño): aparece como paso opcional post primer login.
- [ ] **9.6** UI "Ingresar PIN" (pantalla 6.5): reemplaza el login normal en accesos posteriores del mismo dispositivo, con opción "Usar contraseña en su lugar".
- [ ] **9.7** Opción para desactivar el PIN desde configuración del dispositivo actual.

### Modo oscuro
- [ ] **9.8** Instalar y configurar `next-themes` (`ThemeProvider attribute="class" defaultTheme="system" enableSystem`).
- [ ] **9.9** Agregar variables CSS del bloque `.dark` a `globals.css` (ver sistema de diseño, sección 4).
  - *Aceptación:* al cambiar la preferencia del sistema operativo, la app cambia de tema sin recargar.
- [ ] **9.10** Agregar toggle manual de tema (claro/oscuro/sistema) en la UI (ej. en configuración o header).
  - *Aceptación:* la elección manual persiste entre sesiones (localStorage) y anula la preferencia del sistema hasta que el usuario la reinicie.
- [ ] **9.11** Revisar todas las pantallas existentes (Fases 2 a 8) en modo oscuro para verificar contraste y legibilidad, especialmente en los montos (Spline Sans Mono) y el gráfico del "traslape".

---

## Notas para el agente de código

- Completar las fases **en orden**; dentro de cada fase, las tareas también siguen orden salvo indicación contraria.
- Antes de iniciar la Fase 7, actualizar `schema.prisma` con el modelo `Notification` y correr una nueva migración — no estaba contemplado en el schema original de las especificaciones técnicas.
- Cualquier ambigüedad no cubierta en este backlog debe resolverse consultando `Duofin_Especificaciones_Funcionales.md` y `Duofin_Especificaciones_Tecnicas.md` antes de tomar decisiones por cuenta propia.
