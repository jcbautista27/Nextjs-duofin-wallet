# Sistema de Diseño — Duofin

**Versión:** 1.1 (MVP)
**Propósito:** Guía visual para que el agente de código implemente la UI de forma consistente (Tailwind + shadcn/ui).

---

## 1. Concepto de diseño: "El traslape"

Duofin es de a dos. La identidad visual se construye sobre un motivo simple: **dos círculos de color que se superponen**, uno por cada miembro de la pareja. Donde se cruzan, aparece un tono dorado — el "espacio combinado". Este motivo se repite en:
- Avatares de usuario (anillo de color individual).
- El gráfico de balance del dashboard (el "traslape" muestra el balance combinado).
- Estados vacíos y de carga.
- El ícono/logo de la app.

Se evita deliberadamente la paleta genérica de IA (crema cálido + terracota `#D97757`). En su lugar: un verde jade profundo y un ciruela apagado, ninguno de los dos "cliché", que juntos generan un dorado cálido en su intersección.

---

## 2. Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `--background` | `#F5F6F3` | Fondo general de la app (blanco cálido con matiz verdoso, no crema). |
| `--foreground` | `#1C2622` | Texto principal (tinta verde oscuro, no negro puro). |
| `--partner-jade` | `#1F6F5C` | Color de identidad — primer usuario del espacio. |
| `--partner-jade-bg` | `#E1F0EA` | Fondo suave para tags/avatares del usuario jade. |
| `--partner-plum` | `#7A3F5E` | Color de identidad — segundo usuario del espacio. |
| `--partner-plum-bg` | `#F0E3EA` | Fondo suave para tags/avatares del usuario plum. |
| `--combined-gold` | `#C9A227` | Acento para balance combinado, CTAs principales, el "traslape". |
| `--combined-gold-bg` | `#F7EFD6` | Fondo suave para tarjetas de balance combinado. |
| `--income` | `#1F6F5C` | Montos positivos (reutiliza jade). |
| `--expense` | `#B5442E` | Montos negativos (rojo ladrillo apagado, no rojo semáforo). |
| `--border` | `#DEDBD0` | Bordes y divisores. |
| `--muted-foreground` | `#6B6F68` | Texto secundario. |

**Nota:** los colores `jade`/`plum` son los valores por defecto asignados automáticamente (usuario principal = jade, invitado = plum). No son configurables en el MVP.

### 2.1 Paleta — modo oscuro

Mismo sistema de tokens, ajustado en luminosidad para fondo oscuro. Los tonos de identidad (jade/plum/gold) se aclaran para mantener contraste sobre fondo oscuro.

| Token | Hex (oscuro) | Uso |
|---|---|---|
| `--background` | `#1B211E` | Fondo general (pino oscuro, no negro puro). |
| `--foreground` | `#EDEFEA` | Texto principal. |
| `--card` | `#232A26` | Fondo de tarjetas/superficies elevadas. |
| `--partner-jade` | `#3FA383` | Jade aclarado para contraste sobre fondo oscuro. |
| `--partner-jade-bg` | `#243830` | Fondo suave (oscuro) para tags del usuario jade. |
| `--partner-plum` | `#C084A8` | Plum aclarado. |
| `--partner-plum-bg` | `#382530` | Fondo suave (oscuro) para tags del usuario plum. |
| `--combined-gold` | `#E0BB4A` | Gold aclarado — balance combinado, CTAs. |
| `--combined-gold-bg` | `#3A311A` | Fondo suave (oscuro) para tarjetas de balance combinado. |
| `--income` | `#3FA383` | Montos positivos. |
| `--expense` | `#E0876A` | Montos negativos (ladrillo aclarado). |
| `--border` | `#333B36` | Bordes y divisores. |
| `--muted-foreground` | `#9AA097` | Texto secundario. |

**Regla de implementación:** usar `next-themes` con estrategia `class` (agrega `class="dark"` al `<html>`) y definir ambos bloques de variables CSS (`:root` para claro, `.dark` para oscuro) — ver sección 4. Por defecto, `next-themes` respeta `prefers-color-scheme` del sistema; el toggle manual sobreescribe y persiste la elección en `localStorage`.

---

## 3. Tipografías

| Rol | Fuente | Uso |
|---|---|---|
| **Display** | [Fraunces](https://fonts.google.com/specimen/Fraunces) (variable, weights 400/500/600) | Títulos, encabezados de sección, el monto grande del balance combinado. Serif con carácter — evita el look genérico de IA. |
| **UI / Cuerpo** | [Work Sans](https://fonts.google.com/specimen/Work+Sans) (400/500) | Texto de interfaz, formularios, navegación, párrafos. |
| **Numérica / Montos** | [Spline Sans Mono](https://fonts.google.com/specimen/Spline+Sans+Mono) (400/500) | **Todos los montos de dinero**, sin excepción — alineación tabular perfecta, sensación de precisión financiera. Firma tipográfica de la app. |

**Regla:** cualquier número que represente dinero (balance, monto de transacción, totales) SIEMPRE usa Spline Sans Mono con `font-variant-numeric: tabular-nums`. El resto del texto usa Work Sans. Los títulos de sección usan Fraunces.

### Escala tipográfica
| Nivel | Tamaño | Fuente | Peso |
|---|---|---|---|
| Display (balance combinado) | 40px | Spline Sans Mono | 500 |
| H1 | 28px | Fraunces | 600 |
| H2 | 20px | Fraunces | 500 |
| H3 / Card title | 16px | Work Sans | 500 |
| Body | 14px | Work Sans | 400 |
| Caption / muted | 12px | Work Sans | 400 |
| Monto en lista | 15px | Spline Sans Mono | 500 |

---

## 4. Configuración técnica (para el agente)

### Google Fonts (en `layout.tsx` con `next/font/google`)
```ts
import { Fraunces, Work_Sans, Spline_Sans_Mono } from 'next/font/google';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', weight: ['400','500','600'] });
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['400','500'] });
const splineMono = Spline_Sans_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500'] });
```

### Variables CSS (globals.css, para tema shadcn/ui + next-themes)
```css
:root {
  --background: 60 12% 96%;       /* #F5F6F3 */
  --foreground: 156 15% 13%;      /* #1C2622 */

  --primary: 43 65% 47%;          /* #C9A227 - combined-gold */
  --primary-foreground: 43 65% 15%;

  --partner-jade: 168 55% 27%;    /* #1F6F5C */
  --partner-jade-bg: 156 30% 92%; /* #E1F0EA */
  --partner-plum: 328 33% 36%;    /* #7A3F5E */
  --partner-plum-bg: 335 30% 93%; /* #F0E3EA */

  --income: 168 55% 27%;
  --expense: 8 55% 42%;           /* #B5442E */

  --border: 45 15% 85%;           /* #DEDBD0 */
  --muted-foreground: 100 3% 43%; /* #6B6F68 */

  --radius: 0.75rem;
}

.dark {
  --background: 156 12% 12%;      /* #1B211E */
  --foreground: 90 13% 92%;       /* #EDEFEA */
  --card: 150 10% 15%;            /* #232A26 */

  --primary: 43 68% 61%;          /* #E0BB4A */
  --primary-foreground: 43 60% 15%;

  --partner-jade: 161 43% 44%;    /* #3FA383 */
  --partner-jade-bg: 150 25% 17%; /* #243830 */
  --partner-plum: 320 30% 65%;    /* #C084A8 */
  --partner-plum-bg: 330 22% 18%; /* #382530 */

  --income: 161 43% 44%;
  --expense: 14 68% 65%;          /* #E0876A */

  --border: 140 8% 22%;           /* #333B36 */
  --muted-foreground: 100 6% 62%; /* #9AA097 */
}
```

**Setup de next-themes** (en `app/layout.tsx`, envolviendo el contenido con `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`).

### Tailwind config (extend)
```ts
fontFamily: {
  display: ['var(--font-display)'],
  sans: ['var(--font-sans)'],
  mono: ['var(--font-mono)'],
},
colors: {
  'partner-jade': 'hsl(var(--partner-jade))',
  'partner-jade-bg': 'hsl(var(--partner-jade-bg))',
  'partner-plum': 'hsl(var(--partner-plum))',
  'partner-plum-bg': 'hsl(var(--partner-plum-bg))',
  income: 'hsl(var(--income))',
  expense: 'hsl(var(--expense))',
}
```

---

## 5. Componentes clave y estilo

- **Bordes:** 1px, color `--border`, radio `12px` en cards, `8px` en inputs/botones.
- **Sombras:** ninguna (flat design). Solo un `focus ring` sutil en inputs.
- **Avatares:** círculo con inicial, fondo `partner-jade-bg`/`partner-plum-bg` según el usuario, texto en el color sólido correspondiente.
- **Badges de categoría:** pill (`border-radius: 999px`), fondo suave, texto en el tono oscuro de la misma familia.
- **Botón primario:** fondo `combined-gold`, texto oscuro (no blanco — el dorado es claro).
- **El "traslape"** en el dashboard: dos círculos translúcidos (jade y plum) superpuestos, con el balance combinado en dorado en la zona de intersección.

---

## 6. Wireframes — estructura de pantallas

### 6.1 Login / Registro
```
┌─────────────────────────────────┐
│         [Logo Duofin]           │
│                                  │
│   Bienvenido de nuevo            │
│   ┌───────────────────────┐    │
│   │ Email                  │    │
│   └───────────────────────┘    │
│   ┌───────────────────────┐    │
│   │ Contraseña              │    │
│   └───────────────────────┘    │
│   [   Iniciar sesión   ]        │
│   ¿No tienes cuenta? Regístrate │
└─────────────────────────────────┘
```

### 6.2 Dashboard (pantalla principal)
```
┌──────────────────────────────────────────────┐
│ Duofin      [Mía] [De mi pareja] [Combinada]🔔│
├──────────────────────────────────────────────┤
│                                                │
│         ⬤ Jade      ⬤⬤ Gold      Plum ⬤       │
│         [balance A]  [combinado]  [balance B] │
│                                                │
├──────────────────────────────────────────────┤
│ Últimas transacciones          [+ Nueva]      │
│ ─────────────────────────────────────────    │
│ 🟢 Sueldo            Jade      + S/ 3,500.00  │
│ 🔴 Alimentación       Plum      - S/   120.50 │
│ 🔴 Transporte         Jade      - S/    45.00 │
└──────────────────────────────────────────────┘
```

### 6.3 Nueva transacción (modal/dialog)
```
┌───────────────────────────┐
│ Nueva transacción      [x]│
│ ○ Ingreso   ● Gasto        │
│ Monto:  S/ [___________]  │
│ Categoría: [Alimentación▾]│
│ Fecha:  [23/08/2026]      │
│ Nota (opcional): [______] │
│      [Cancelar] [Guardar] │
└───────────────────────────┘
```

### 6.4 Espacio de pareja
```
┌──────────────────────────────────┐
│ Tu espacio Duofin                 │
│ ⬤ Tú (jade)   ⬤ Pareja (plum)    │
│                                    │
│ [Invitar a mi pareja]             │
│ [Desvincular espacio]             │
└──────────────────────────────────┘
```

### 6.5 Ingresar PIN (acceso rápido)
```
┌─────────────────────────────────┐
│         [Logo Duofin]           │
│      Hola de nuevo, Tú           │
│                                  │
│      ○ ○ ○ ○ ○ ○                │
│      [ teclado numérico ]       │
│                                  │
│   Usar contraseña en su lugar   │
└─────────────────────────────────┘
```

### 6.6 Configurar PIN (post primer login)
```
┌─────────────────────────────────┐
│  Crea un PIN de acceso rápido    │
│  para este dispositivo            │
│                                  │
│      ○ ○ ○ ○ ○ ○                │
│      [ teclado numérico ]       │
│                                  │
│   [   Confirmar PIN   ]         │
│   Ahora no                       │
└─────────────────────────────────┘
```

---

## 7. Changelog
- **v1.1** (2026-08-30): agregada paleta de modo oscuro (sección 2.1), setup de next-themes, wireframes de PIN (6.5, 6.6). Ver `docs/changes/2026-08-30_pin-login-y-modo-oscuro.md`.
- **v1.0** (2026-08-2026): versión inicial del MVP.
