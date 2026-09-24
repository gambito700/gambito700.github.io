# ADR-008: Composicion de capas UX del portfolio

Fecha: 2026-09-24
Estado: Aceptado
Fase: P0.8 (task 7f503a66)
Commits: b662787, 7367c68

## Contexto

El P0 entrego una UX basica para no tecnicos: wizard de bienvenida por
sesion (sessionStorage), hint "Click to start" via toast, FAB de WhatsApp
y boton help. El usuario detecto friccion de entrada: el wizard aparecia en
cada sesion nueva sin sensacion de ingreso controlado y el hint era fugaz.
Se pidio una experiencia de entrada mas pulida y guiada, bilingue ES/EN,
que presentara el portafolio como producto antes de revelar el escritorio.

## Decision

Componer dos capas UX, pensadas como stack de capas sobre el escritorio:

1. Splash screen (#splash-screen) en CADA carga: reloj gigante bilingue
   (es-CL/en-US), CTA "Entrar como Reclutador / Cliente" / "Enter as
   Recruiter / Client", z-index 4000 centralizado en
   EMULATOR.Z_INDEX.SPLASH (js/config.js), fade .splash-leaving y remove
   del DOM tras 500ms. Al entrar dispara el evento window 'app-ready', que
   main.js usa como gate para abrir la musica (el autoplay del navegador
   exige un gesto de usuario previo).
2. Onboarding guiado SOLO en la primera visita: clave g700_onboarding_done
   en localStorage via StorageUtil. Tour de 2 pasos con spotlight + tooltip
   sobre el icono Mi Curriculumn (data-onboard="step1", con fallback por
   onclick) y sobre #fab-wrap. Terminar o saltar fija la clave y dispara el
   evento window 'onboarding-resolved' (detail.finished).

El wizard #welcome-wizard y el hint de P0 se ELIMINAN (markup y logica);
FAB y help se mantienen intactos. Se conserva el clic unico (D2): el spec
original deciia "doble clic" y el copy se corrigio a "Haz clic aqui"
(microcopy mapping exacto D5 registrado en docs/dev-log.md).

## Consecuencias

+ Splash determinista en cada carga: entrada cinematografica y controlada.
+ Onboarding visto una sola vez por navegador (localStorage), sin friccion
  para visitantes recurrentes.
+ La musica queda detras de un gesto real de usuario (app-ready /
  onboarding-resolved), respetando politicas de autoplay y mejorando la
  confiabilidad del reproductor.
+ Menos codigo y menos superficie UX: desaparecen wizard por sesion y hint.
- El splash agrega un paso "Entrar" a cada carga (trade-off de velocidad
  percibida, aceptado por diseno).
- La clave de localStorage es persistente y no hay reset de tour en UI: si
  el visitante salta el tour, no vuelve a verse.
- Deuda de accesibilidad no bloqueante registrada (S1-S3) y de estilo (S6):
  ver docs/adr-009-ux-tech-debt.md.

## Alternativas evaluadas

1. Wizard por sesion (sessionStorage) - ya existia en P0; descartado porque
   repetia en cada sesion sin sensacion de entrada y convivia con el hint.
2. Doble clic como interaccion principal - descartado (D2): contradice la
   convencion web y el copy ya publicado; se mantiene clic unico.
3. Coexistencia de 4 capas (splash + onboarding + wizard + hint) - evaluada
   y rechazada: sobrecarga UX y codigo; wizard/hint se eliminan.
4. Onboarding con localStorage con expiracion - considerada; se eligio
   persistencia simple (g700_onboarding_done) para minimizar superficie.

## Referencias

- docs/dev-log.md, entrada 2026-09-24 P0.8 (decisiones D1-D5)
- docs/adr-009-ux-tech-debt.md
- README.md, secciones Roadmap y Estado P0
