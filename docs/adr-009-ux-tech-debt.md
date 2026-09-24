# ADR-009: Deuda tecnica diferida a P2 y deuda UX no bloqueante de P0.8

Fecha: 2026-09-24
Estado: Aceptado (deuda registrada, NO implementada)
Fase: P0.8 (task 7f503a66)

## Contexto

Durante la implementacion y revision del P0.8 se identificaron multiples
fuentes de deuda tecnica. La migracion completa (onclick -> addEventListener,
CSP sin unsafe-inline, split de style.css) estaba planificada para P2 del
roadmap. El usuario decidio explicitamente NO tocar onclick/CSP/CSS split en
este ciclo (decision D4) por riesgo de romper comportamiento ya verificado
(14 ventanas operativas), y pidio registrar la deuda en lugar de implementarla.

## Decision

Diferir a P2 la deuda estructural y registrar en este ADR la deuda mayor y
las sugerencias no bloqueantes de la revision (S1-S4, S6). S5 (vault/ en
.gitignore) quedo RESUELTO en el commit 7367c68.

### Deuda estructural diferida a P2

- 79 atributos onclick= inline en index.html (medidos 2026-09-24).
- 27 atributos onkeydown= inline en index.html (medidos 2026-09-24).
- CSP declarada via meta tag con 'unsafe-inline' (limite documentado de
  GitHub Pages, que no permite headers HTTP custom).
- css/style.css monolito (~87 KB al momento de la revision; 93.4 KB tras
  P0.8) sin split. P2: style.css como entry de @imports.

Riesgo asumido: los handlers inline dificultan la auditoria de eventos y el
endurecimiento de la CSP; el monolito CSS crece en coste de mantenimiento.
Impacto funcional: nulo en el comportamiento verificado del P0.8.

## Sugerencias de la revision (deuda no bloqueante)

S1. Focus trap en splash: #splash-screen declara role=dialog y
    aria-modal=true pero no implementa focus trap. Considerar autofocus en
    #splash-enter o quitar aria-modal para no prometer un modal que no es.
S2. Tooltip del tour: usa aria-label fijo "Onboarding"; conviene
    aria-labelledby apuntando a .ux-tooltip-title para anunciar el titulo
    real de cada paso.
S3. Onboarding: tras stop() del tour no se devuelve el foco; devolverlo a
    #start-btn (mismo patron que ya usa el splash tras su remove).
S4. js/features/onboarding.js, _positionStep: el comentario menciona
    compensar scrollX/scrollY, pero hoy es no-op (root sin scroll) y seria
    fragile si el root comienza a scrollear. Corregir comentario o mecanismo.
S6. js/features/ux.js sin newline final: viola .editorconfig (final newline)
    y la convencion LF del proyecto; normalizar.

## Consecuencias

+ Alcance P0.8 contenible: 6 archivos, verificado (node --check, encoding
  57/57, E2E 24/24 del implementador + 10/10 independiente, revision
  APROBADO).
+ Deuda priorizada y trazable en un solo documento, con numeros medidos.
- La CSP seguira con unsafe-inline mientras existan los 79 onclick.
- El monolito CSS seguira creciendo hasta la migracion a @imports en P2.

## Referencias

- docs/adr-008-ux-layers.md
- docs/dev-log.md, entrada 2026-09-24 P0.8
- README.md, roadmap P2 (migracion addEventListener + CSP + split CSS)
