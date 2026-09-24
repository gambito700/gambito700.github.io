# ADR-010: Retencion de tutorial en cada carga (iteracion P0.9)

Fecha: 2026-09-24
Estado: Aceptado (supersede parcialmente ADR-008)
Fase: P0.9 (task 8ae264f5)
Commits: 8b2a9c9

## Contexto

El ADR-008 (P0.8) decidio mostrar el onboarding guiado SOLO en la primera
visita, gateando el tour detras de la clave g700_onboarding_done en
localStorage. Tras operar con esa configuracion, el usuario decidio
explicitamente invertir la persistencia: el tour debe verse en CADA carga.
Racional: retencion de tutorial intencionada; el visitante recurrente
vuelve a ver el punto de partida del portafolio (Mi Curriculumn) sin
necesidad de recordar la disposicion anterior. 'Saltar ayuda' y Escape
solo afectan la sesion actual: al recargar, el tour vuelve a ofrecerse.

## Decision

1. El tour de onboarding se muestra en cada carga. Se elimina por completo
   la clave g700_onboarding_done: deja de leerse (ux.js, onboarding.js) y
   de escribirse (onboarding.js stop()); StorageUtil ya no se importa en
   onboarding.js, ux.js ni main.js.
2. main.js unifica el camino de la musica: tras 'app-ready' espera
   'onboarding-resolved' ({ once: true }) y abre window-music a los 400ms.
   Desaparece la rama de visitante recurrente (600ms) y la dependencia de
   localStorage.
3. No se persiste ningun estado del tour: 'Saltar ayuda'/Escape/Finalizar
   limpian DOM y listeners; el proximo refresh reactiva el tour.

## Decision puntual relacionada: layout startup sin solape

El mismo ciclo incluyo la disposicion inicial de ventanas sin solape
(_layoutStartupWindows en js/core/window-manager.js: window-cv en (40,40);
window-music a la derecha del CV o debajo segun viewport). Para que el
tamano de diseno de las dos ventanas de arranque sobreviviera a la media
query del rango LG, el usuario aprobo una exencion puntual: dentro de
(min-width:1024px) and (max-width:1199px), #window-cv (600x480) y
#window-music (340x180) conservan tamano de diseno (!important). Es una
regla puntual por ID, no un cambio global del sistema de layout.

## Consecuencias

+ El tutorial se ofrece siempre: el visitante recurrente ve el punto de
  partida en cada sesion (decision explicita del usuario).
+ Un solo camino de codigo para abrir la musica: menos ramas y una unica
  dependencia ('onboarding-resolved').
+ Sin estado de tour en localStorage: menos superficie de storage y sin
  claves residuales.
- El tour se repite en cada refresco: friccion potencial para visitantes
  recurrentes (aceptado por decision explicita del usuario).
- La exencion LG por ID agrega una regla puntual fuera del sistema de
  tamano; el tamano de diseno ahora vive en 3 lugares (index.html inline,
  CSS overrides, JS math) - ver R1.
- Sin fallback: si 'onboarding-resolved' nunca ocurriera, la musica no se
  abriria (ver R2).
- El rango MD (768-1023px) sigue forzado por el clamp(80vw/65vh) (ver R3).

## Supersede

Parcialmente ADR-008: se mantiene intacta la capa de splash (P0.8); se
invierte la persistencia del onboarding (punto 2 del Decision de ADR-008)
y sus consecuencias asociadas ("visto una sola vez por navegador",
"no hay reset de tour"). ADR-008 queda como contexto historico de la
decision original.

## Deuda no bloqueante (revision P0.9)

R1. Magic numbers en _layoutStartupWindows (40/600/480/340/180/50/24/12/
    15/10) sin nombre ni comentario; el tamano de diseno vive en 3 lugares
    (index.html inline, CSS overrides, JS math) - riesgo de drift.
R2. main.js: el unico camino depende de que 'onboarding-resolved' ocurra;
    sugerido fallback timeout (5-8s) tras app-ready para abrir la musica.
R3. Rango MD 768-1023px: la media query clamp(80vw/65vh) !important sigue
    forzando el tamano de las ventanas; si se quiere cubrir, extender
    exenciones por ID o leer el tamano real del DOM. Mejora vs antes pero
    no perfecto.
R4. Repeticion del tour en cada refresco: friccion potencial para
    visitantes recurrentes (decision explicita del usuario); foco queda en
    body al cerrar el tour (herencia P0.8, ver S3 de ADR-009).

## Referencias

- docs/adr-008-ux-layers.md (contexto historico P0.8)
- docs/adr-009-ux-tech-debt.md (deuda UX no bloqueante de P0.8)
- docs/dev-log.md, entrada 2026-09-24 P0.9
- README.md, secciones Roadmap y Estado P0