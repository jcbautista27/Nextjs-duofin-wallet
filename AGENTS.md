# AGENTS.md — Duofin

Este es el punto de entrada para cualquier agente de código (OpenCode u otro) que trabaje en este repositorio. Lee este archivo primero, completo, antes de escribir código.

---

## 1. Qué es Duofin

Web app de finanzas personales para parejas. Cada usuario tiene su propia cuenta con registro manual de ingresos y gastos; existe una vista combinada del balance de la pareja. Registro 100% manual (sin sync bancaria) en el MVP.

---

## 2. Documentos de referencia (en orden de lectura)

Todos están en `docs/`. Léelos en este orden antes de empezar a construir:

1. **`Duofin_Especificaciones_Funcionales.md`** — el qué y para quién. Usuarios, roles, reglas de negocio, funcionalidades del MVP, fuera de alcance.
2. **`Duofin_Especificaciones_Tecnicas.md`** — el cómo. Stack, arquitectura, `schema.prisma` completo, endpoints, estructura de carpetas, seguridad.
3. **`Duofin_Sistema_Diseno.md`** — paleta de colores, tipografías, variables CSS/Tailwind, y el concepto de marca ("el traslape").
4. **`wireframes/Duofin_Wireframes.html`** — estructura de las 9 pantallas del MVP (abrir en navegador; tiene navegación por pestañas).
5. **`Duofin_Backlog.md`** — **el documento operativo**. Lista de tareas secuenciales con criterios de aceptación, fase por fase. Es lo que debes seguir para construir, tarea por tarea.

Si hay una ambigüedad o conflicto entre documentos, resuélvela consultando estos archivos en este orden de prioridad antes de decidir por tu cuenta.

---

## 3. Stack (resumen — detalle completo en especificaciones técnicas)

Next.js 14+ (App Router) · TypeScript · PostgreSQL · Prisma · NextAuth.js · Tailwind CSS · shadcn/ui · Zod + React Hook Form · pnpm

No introduzcas librerías fuera de este stack sin justificarlo explícitamente y confirmarlo en el commit/PR correspondiente.

---

## 4. Cómo trabajar

- Sigue **`Duofin_Backlog.md`** de forma secuencial: fase por fase, tarea por tarea. No saltes fases salvo que el backlog indique explícitamente que pueden hacerse en paralelo.
- Cada tarea del backlog tiene un criterio de aceptación (`*Aceptación:*`). No la marques como completa hasta cumplirlo.
- Todo color y fuente que uses debe salir de `Duofin_Sistema_Diseno.md` (sección 4: variables CSS y config de Tailwind ya están listas para copiar).
- Toda pantalla que construyas debe corresponder a una de las 9 en `Duofin_Wireframes.html`. Si crees que falta una pantalla no contemplada, señálalo antes de improvisarla.
- Los montos de dinero SIEMPRE se muestran en la fuente `Spline Sans Mono` (ver sistema de diseño, sección 3).
- Moneda única del MVP: Soles (PEN). No implementes selección ni conversión de moneda.

---

## 5. Reglas de negocio críticas (no te las saltees)

- Un usuario pertenece a **un solo** espacio de pareja (`Space`) a la vez.
- Al desvincularse, el `Space` se **archiva** (`status: ARCHIVED`), nunca se elimina. Los datos quedan disponibles solo para consulta.
- Las categorías personalizadas son **siempre compartidas** dentro del `Space` (no privadas por usuario).
- Un usuario solo puede editar/eliminar **sus propias** transacciones y categorías personalizadas.
- Al registrar una transacción, se genera una notificación in-app para el otro miembro del `Space`. No hay recordatorios proactivos en el MVP.

---

## 6. Fuera de alcance del MVP (no implementar sin confirmarlo antes)

Sincronización bancaria automática · app móvil nativa · presupuestos y metas de ahorro · gestión de deudas e inversiones · reportes avanzados/exportación · multi-moneda.

---

## 7. Estructura de carpetas esperada

```
duofin/
├── docs/                    ← este archivo y los 4 documentos de referencia
├── prisma/                  ← schema.prisma + seed.ts (Fase 1 del backlog)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   └── api/
│   ├── components/
│   ├── lib/
│   └── types/
├── .env.example
├── package.json
└── README.md
```

(Detalle completo en `Duofin_Especificaciones_Tecnicas.md`, sección 5.)

---

## 8. Al terminar cada fase

Antes de pasar a la siguiente fase del backlog, verifica que:
- El proyecto compila/corre sin errores (`pnpm dev`).
- Los criterios de aceptación de todas las tareas de la fase se cumplen.
- No quedaron variables de entorno hardcodeadas ni secretos en el código.
