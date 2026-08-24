# Especificaciones Funcionales — Duofin

**Versión:** 1.0 (MVP)
**Fecha:** Agosto 2026
**Tipo de producto:** Web App para gestión de finanzas personales en pareja

---

## 1. Resumen del producto

Duofin es una aplicación web pensada para parejas que quieren llevar el control de sus finanzas personales manteniendo **cuentas individuales separadas**, pero con la posibilidad de ver una **vista combinada** de su situación financiera como pareja.

### 1.1 Objetivo del MVP
Permitir a dos personas (pareja) registrar manualmente sus ingresos y gastos, organizarlos por categorías, y visualizar su balance individual y combinado.

### 1.2 Fuera de alcance (MVP)
- Sincronización automática con bancos.
- App móvil nativa (se evaluará en fases futuras).
- Presupuestos y metas de ahorro.
- Gestión de deudas e inversiones.
- Reportes avanzados y exportación de datos.
- Multi-moneda.

---

## 2. Usuarios y roles

### 2.1 Tipos de usuario
| Rol | Descripción |
|---|---|
| **Usuario principal** | Crea la cuenta de pareja ("espacio Duofin") e invita a su pareja. |
| **Usuario invitado** | Acepta la invitación y se une al espacio compartido. |

### 2.2 Nivel de acceso
Ambos usuarios (principal e invitado) tienen el **mismo nivel de permisos** una vez dentro del espacio compartido: cada uno gestiona sus propias transacciones y puede ver la información combinada. No hay jerarquía de administrador sobre los datos del otro.

### 2.3 Flujo de vinculación de pareja
1. Usuario A se registra en Duofin.
2. Usuario A crea un "espacio de pareja" e invita a Usuario B (por correo electrónico).
3. Usuario B recibe la invitación, se registra o inicia sesión, y acepta.
4. Ambos quedan vinculados al mismo espacio compartido, cada uno con su cuenta individual dentro de él.

### 2.4 Reglas de pertenencia y desvinculación
- Un usuario solo puede pertenecer a **un espacio de pareja a la vez**. Para unirse a uno nuevo, primero debe salir del actual.
- Si la pareja se desvincula, el espacio se **archiva** (no se elimina): cada usuario conserva acceso de solo consulta a su historial y al histórico combinado, pero ya no se registran nuevas transacciones conjuntas en ese espacio.

---

## 3. Estructura de cuentas y datos financieros

### 3.1 Modelo de cuentas
- Cada usuario tiene su **propia cuenta financiera individual** (sus ingresos y gastos son privados en su registro, pero visibles para ambos en el espacio compartido).
- Existe una **vista combinada** que agrega los datos de ambos usuarios para mostrar el balance total de la pareja.

### 3.2 Transacciones
Cada transacción (ingreso o gasto) registrada manualmente debe incluir:
- Monto
- Tipo (ingreso / gasto)
- Categoría
- Fecha
- Descripción/nota (opcional)
- Usuario al que pertenece (automático, según quién la registra)

### 3.3 Categorías
- El sistema incluye un set de **categorías predefinidas** (ej. Vivienda, Alimentación, Transporte, Salud, Entretenimiento, Ingresos - Sueldo, Ingresos - Otros, etc.).
- Cada usuario puede **crear categorías personalizadas** adicionales.
- Las categorías personalizadas son **siempre compartidas**: en cuanto un usuario crea una categoría nueva, queda disponible para ambos miembros del espacio de pareja.

---

## 4. Funcionalidades del MVP

### 4.1 Gestión de usuarios
- Registro e inicio de sesión.
- Creación de espacio de pareja.
- Invitación y aceptación de pareja.

### 4.2 Registro de transacciones
- Alta manual de ingresos.
- Alta manual de gastos.
- Edición y eliminación de transacciones propias.
- Asignación de categoría (predefinida o personalizada).

### 4.3 Categorías
- Ver listado de categorías predefinidas.
- Crear categoría personalizada.
- Editar/eliminar categoría personalizada propia.

### 4.4 Balance y vista combinada
- Balance individual (ingresos - gastos) por usuario.
- Balance combinado de la pareja.
- Listado/historial de transacciones, filtrable por usuario, categoría y rango de fechas.

### 4.5 Notificaciones
- Cuando un usuario registra una nueva transacción, su pareja recibe una notificación dentro de la app (ej. "Tu pareja registró un nuevo gasto en Alimentación").
- No se contemplan recordatorios proactivos (ej. "no has registrado gastos hoy") en el MVP.
- *(A definir en diseño):* ¿la notificación es solo in-app o también por correo electrónico?

---

## 5. Flujos de usuario principales

### 5.1 Registro de un gasto
1. El usuario inicia sesión.
2. Va a "Nueva transacción".
3. Selecciona tipo "Gasto".
4. Ingresa monto, categoría, fecha y nota opcional.
5. Guarda. La transacción aparece en su historial individual y en la vista combinada.

### 5.2 Consulta de balance combinado
1. El usuario accede al dashboard principal.
2. Ve su balance individual y el balance combinado de la pareja.
3. Puede alternar entre vista "Mía", "De mi pareja" y "Combinada".

---

## 6. Requisitos no funcionales

- **Plataforma:** Web app (responsive, accesible desde desktop y navegador móvil).
- **Seguridad:** Autenticación segura; los datos financieros de cada usuario deben protegerse ante accesos no autorizados fuera del espacio de pareja.
- **Privacidad:** Definir claramente qué información es visible entre los miembros de la pareja (ver punto 3.1 y 3.3).
- **Usabilidad:** Registro de una transacción en pocos pasos (mínima fricción, dado que es 100% manual).
- **Moneda:** La app opera en **Soles (PEN)** en el MVP. No se contempla multi-moneda ni conversión en esta fase.

---

## 7. Decisiones de producto confirmadas

| Tema | Decisión |
|---|---|
| Categorías personalizadas | Siempre compartidas entre ambos miembros del espacio. |
| Desvinculación de pareja | El espacio se archiva; los datos quedan disponibles solo para consulta. |
| Pertenencia a espacios | Un usuario solo puede estar en un espacio de pareja a la vez. |
| Notificaciones | Se notifica dentro de la app cuando la pareja registra una nueva transacción. Sin recordatorios proactivos en el MVP. |
| Moneda | Soles (PEN), sin soporte multi-moneda en el MVP. |

**Detalle pendiente para la fase de diseño:** definir si las notificaciones de nueva transacción también se envían por correo electrónico o quedan solo in-app.

---

## 8. Posibles fases futuras (fuera del MVP actual)

- Presupuestos mensuales y metas de ahorro compartidas.
- Sincronización bancaria automática.
- App móvil nativa.
- Reportes y gráficos avanzados, exportación (CSV/PDF).
- Gestión de deudas e inversiones.
- Soporte multi-moneda.
