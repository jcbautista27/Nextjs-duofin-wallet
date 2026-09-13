# Propuesta de cambio — Corrección de fechas + Dashboard de reportes

**Fecha:** 2026-09-12
**Estado:** Aprobada
**Impacto:** Especificaciones Funcionales, Especificaciones Técnicas, Sistema de Diseño, Wireframes, Backlog (2 fases nuevas)

---

## 1. Bugfix — fecha de transacción se corre 1 día

**Síntoma reportado:** al registrar una transacción con fecha X, aparece en el historial como X-1 día.

**Causa raíz:** el input de fecha se interpreta como medianoche UTC. Al mostrarse con métodos de fecha "locales" del navegador (zona horaria Perú, UTC-5), retrocede al día anterior. Es un bug de manejo de zona horaria, no un comportamiento esperado.

**Solución:** tratar la fecha de una transacción como "solo fecha" (día calendario), sin componente de hora sensible a zona horaria: guardar a mediodía UTC y formatear siempre con métodos UTC, nunca locales, en toda la app.

---

## 2. Dashboard de reportes — gastos por categoría + recomendaciones

**Qué es:** una pantalla de "Reportes" con:
- 3 métricas del periodo: total gastado, total ingresos, balance combinado.
- Gráfico donut de gastos por categoría + ranking con porcentajes.
- Comparación "Tú vs Pareja" por categoría (barras agrupadas).
- Tarjetas de recomendación generadas por **reglas simples con umbrales fijos** (sin IA): categoría que más subió (%), categoría con mayor peso relativo del gasto total, tasa de ahorro del periodo.

**Por qué:** con varios registros ya cargados, el valor de la app pasa de "registrar" a "entender y tomar acción" sobre los gastos.

**Diseño validado:** mockup HTML revisado y aprobado por el usuario (ver conversación del 2026-09-12).

---

## 3. Decisión

Ambas mejoras se aprueban. Se agregan como **Fase 10** (bugfix de fechas) y **Fase 11** (dashboard de reportes) del backlog.
