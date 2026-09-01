# Propuesta de cambio — Login rápido con PIN + Modo oscuro

**Fecha:** 2026-08-30
**Estado:** Aprobada
**Impacto:** Especificaciones Funcionales, Especificaciones Técnicas, Sistema de Diseño, Wireframes, Backlog (nueva fase)

---

## 1. Login rápido con PIN

**Qué es:** después del primer login normal (email + contraseña) en un dispositivo, el usuario puede configurar un PIN de 6 dígitos para acceder más rápido en ese mismo dispositivo, sin volver a escribir su contraseña completa.

**Por qué:** reduce fricción en el uso diario — la mayoría de aperturas de la app son en el mismo celular/navegador.

**Alcance:**
- El PIN es **local al dispositivo**, no reemplaza la contraseña ni sirve para iniciar sesión desde un dispositivo nuevo.
- Requiere un primer login completo con email/contraseña antes de poder configurar el PIN.
- El usuario puede desactivar el PIN en cualquier momento desde ese dispositivo.

**Qué toca:**
- Nuevo modelo de datos (`Device`) para vincular PIN + dispositivo + usuario.
- Nuevos endpoints (`/api/auth/pin/setup`, `/api/auth/pin/verify`, `/api/auth/pin`).
- Nueva pantalla: "Ingresar PIN" (reemplaza el login normal en accesos posteriores del mismo dispositivo).
- Nueva pantalla/paso: "Configurar PIN" (post primer login).

---

## 2. Modo oscuro

**Qué es:** tema claro/oscuro para toda la app. Por defecto sigue la preferencia del sistema operativo; el usuario puede anularla manualmente con un toggle.

**Qué toca:**
- Paleta de colores en modo oscuro (nuevos tokens en el Sistema de Diseño).
- Toggle de tema en la interfaz (probablemente en configuración o en el header).
- Librería `next-themes` agregada al stack.

---

## 3. Decisión

Ambas features se aprueban para construirse. Se agregan como **Fase 9** del backlog, después del despliegue inicial (Fase 8), ya que son mejoras sobre una app ya funcionando — no bloquean el MVP original.
