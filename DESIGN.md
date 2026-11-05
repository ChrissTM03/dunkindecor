---
name: "Decoración de Producción"
description: "Tablero operativo para registros y consolidación de decoración de donas."
colors:
  page: "#f3f5f7"
  surface: "#ffffff"
  ink: "#172635"
  muted: "#687887"
  line: "#e2e7eb"
  accent: "#e85c32"
  accent-strong: "#ca4927"
  record-control: "#da1884"
  record-control-hover: "#ff671f"
  generated: "#237b57"
  editable: "#926016"
  danger: "#a43e37"
  focus: "#146fc1"
typography:
  display:
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
    fontSize: "clamp(26px, 3vw, 34px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  body:
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
    fontSize: "11px"
    fontWeight: 600
rounded:
  sm: "5px"
  md: "7px"
  lg: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
---

# Design System: Decoración de Producción

## Overview

**Creative North Star: "El tablero de turno"**

La interfaz convierte el trabajo repetido de registrar y revisar cantidades en un tablero operativo claro. Su tono es directo y profesional: cada estado se identifica con texto además de color, las acciones quedan junto al registro y los datos mantienen suficiente espacio para leerse de un vistazo.

La identidad vive en una navegación azul carbón y un acento naranja reservado para la acción principal. Los controles del registro mantienen el magenta y el naranja originales del proyecto. El gris frío de fondo mantiene el foco en el trabajo, no en la decoración.

**Key Characteristics:**
- Densidad de tabla legible, con controles próximos al registro.
- Acento naranja para acciones primarias; estados con colores semánticos.
- Navegación oscura y superficies claras para separar orientación y contenido.

## Colors

Una paleta fría y sobria con naranja de acción y colores de estado de contraste alto.

### Primary
- **Naranja de acción** (#e85c32): acción principal, como crear un registro o calcular un consolidado.
- **Naranja profundo** (#ca4927): hover de la acción principal.
- **Magenta de registro** (#da1884): botones para ajustar cantidades y acciones dentro del registro.
- **Naranja original de registro** (#ff671f): hover de los botones del registro; usa texto azul carbón para conservar contraste.

### Neutral
- **Azul carbón** (#172635): texto principal y navegación.
- **Gris pizarra** (#687887): ayuda y texto secundario.
- **Gris de línea** (#e2e7eb): bordes y separadores.
- **Fondo frío** (#f3f5f7): fondo general.
- **Blanco de superficie** (#ffffff): tablas, controles y paneles.

### Named Rules
**La Regla de Estado Explícito.** El estado de un registro siempre conserva su etiqueta textual; el color solo la refuerza.
**La Regla del Control Original.** Los botones del detalle conservan magenta #da1884 y hover naranja #ff671f.

## Typography

**Display Font:** Segoe UI (with Helvetica Neue, Arial, sans-serif fallback)  
**Body Font:** Segoe UI (with Helvetica Neue, Arial, sans-serif fallback)  
**Label/Mono Font:** No separate label or monospace face.

**Character:** Neutral, compact system typography prioritizes quick recognition over display personality.

### Hierarchy
- **Display** (700, `clamp(26px, 3vw, 34px)`, 1.15): page title.
- **Headline** (700, 19px): section and panel titles.
- **Title** (650–700, 13–16px): controls, dates, and table content.
- **Body** (400, 13px, 1.5): explanations and supporting copy.
- **Label** (600–700, 10–12px): table headers, status, and field labels.

## Layout

On wide screens, a fixed 248px navigation rail anchors a centered work area with a maximum width of 1440px. The page heading and primary actions lead into a compact summary strip and a full-width records table. At 820px the navigation becomes a horizontal header; at 620px the heading actions stack to full-width buttons and record rows reflow so status and actions remain visible without requiring horizontal scrolling. Consolidation is an inline panel above the records, with inclusive start and end dates.

## Elevation & Depth

The interface is flat by default. Borders and tonal surfaces define structure; the record dialog alone uses a soft, offset shadow to distinguish its protected editing layer.

### Shadow Vocabulary
- **Record dialog** (`0 24px 70px rgb(7 20 31 / 28%)`): separate the focused record task from the live table.

## Shapes

Controls and surfaces use restrained 5–10px radii. Table rows remain square within a single bordered container; status badges use a pill silhouette. Thin cool-gray borders do most of the structural work.

## Components

### Buttons
- **Shape:** compact, softly rounded controls (7px).
- **Primary:** orange fill, white text, 42px minimum height, 16px horizontal padding.
- **Hover / Focus:** deepen the orange on hover; use a visible 3px blue focus outline.
- **Secondary / Ghost:** white or transparent surface with a cool-gray border or text treatment.
- **Record controls:** original magenta fill (#da1884) with white text; original orange hover (#ff671f) uses charcoal text for contrast.

### Chips
- **Style:** small pill with a tinted background and matching readable text.
- **State:** generated is green; editable is amber. Both include a visible label and dot.

### Cards / Containers
- **Corner Style:** 10px for summary and table containers.
- **Background:** white against the cool-gray page.
- **Shadow Strategy:** borders, not shadows; see Elevation & Depth for the dialog exception.
- **Border:** 1px solid cool gray.
- **Internal Padding:** 16–22px for panels; table rows use compact horizontal padding.

### Inputs / Fields
- **Style:** white fill, 1px cool-gray border, 6px radius, 40px minimum height.
- **Focus:** 3px blue outline with offset; preserve the browser's keyboard-visible affordance.
- **Error:** inline text names the invalid date range and how to correct it.

### Navigation
- **Style:** blue-charcoal rail with light labels and simple line-like symbols.
- **Active:** lighter blue-charcoal surface, stronger label weight, orange marker on wide layouts.
- **Mobile:** horizontal navigation; hide the desktop-only connection footer.

## Do's and Don'ts

### Do:
- **Do** keep “Generado” and “Editable” visible wherever record state appears.
- **Do** keep both date fields and the submit action visible together in the consolidation flow.
- **Do** preserve a visible focus ring and reduced-motion behavior.

### Don't:
- **Don't** change the original magenta/orange color pairing on record-detail buttons.
- **Don't** use orange for non-action information when a semantic status color is more precise.
- **Don't** hide row actions behind horizontal scrolling on narrow screens.
- **Don't** replace the records table with decorative metric cards.
