# Tareas para Especialista Frontend - Auditoría y Refactorización gambito700.github.io

## Contexto General (Especificación Oficial)
**Proyecto:** gambito700.github.io - Auditoría y Refactorización 2026
**Sprint:** 5 días hábiles
**Equipo:** @frontend
**Responsable:** SeniorProjectManager (este documento)
**Fecha de entrega:** Completar antes del final del sprint

### Objetivos Específicos para Frontend
- **Responsividad Móvil:** 100% funcional en móviles (testeado manualmente y con herramientas)
- **Performance:** Colaborar con @Senior Developer para implementar optimizaciones verificables
- **Accesibilidad:** Trabajar con @Compliance Auditor para cumplir WCAG 2.1 AA
- **Métricas Lighthouse:** Alcanzar ≥95/100 en Performance, SEO y Accesibilidad
- **Code Quality:** 80% coverage con Jest, 100% integración Cypress
- **Documentación:** Crear entregables según especificación

---

## Tareas Priorizadas para @frontend (Entrega en 5 días)

### Día 1: Setup y Auditoría Inicial

#### Tarea 1.1: Configuración del Entorno de Trabajo
**Criterio de Aceptación:**
- [ ] Branch `refactor/responsividad-performance` creada desde `main`
- [ ] Entorno local configurado con Node.js LTS y npm
- [ ] Dependencias instaladas (`npm install`)
- [ ] Git hooks configurados para linting automático
- [ ] Variables de entorno `.env.local` creadas según `.env.example`

**Especificación:**
> "Configurar entorno de desarrollo con Node.js, npm, y git hooks para validación automática"

**Notas:**
- Usar stack identificado en configuración del proyecto
- Documentar cualquier dependencia adicional requerida

---

#### Tarea 1.2: Auditoría Inicial de Responsividad
**Criterio de Aceptación:**
- [ ] Generar informe preliminar con Chrome DevTools: Device Mode
- [ ] Identificar al menos 5 breakpoints que necesiten ajustes
- [ ] Documentar problemas principales en GitHub Issues con etiqueta `frontend`, `responsividad`
- [ ] Validar que CSS actual usa unidades relativas (rem/em/%/vw/vh) donde sea posible
- [ ] Rendir informe async a @SeniorProjectManager con screenshots

**Especificación:**
> "@frontend: Valida avance de @Compliance Auditor (accesibilidad) y @frontend (responsividad móviles)"

**Ejemplo de formato para Issues:**
```
## Problema de Responsividad
**Página:** /servicios.html
**Dispositivo:** iPhone SE (320px)
**Descripción:** Header colapsa incorrectamente, padding excesivo
**Solución propuesta:** Ajustar breakpoint a 360px y reducir padding
**Prioridad:** High | Critical
```

---

### Día 2: Implementación de Mejoras

#### Tarea 2.1: Refactorización de Layout Responsivo
**Criterio de Aceptación:**
- [ ] Implementar sistema de grid flexible usando CSS Grid o Flexbox
- [ ] Asegurar que:
  - Todos los elementos sean touch-friendly (≥48x48px)
  - Texto tenga tamaño mínimo 16px en móviles
  - Imágenes usen `max-width: 100%` y `height: auto`
  - Formularios tengan labels visibles y asociados
- [ ] Validar con @Compliance Auditor que se cumpla WCAG 2.1 (1.4.4 Resize text, 1.4.10 Reflow)
- [ ] PR creado con prefijo `perf:` o `fix:` y descripción detallada
- [ ] Approval en PR de @Compliance Auditor (accesibilidad) y @SeniorProjectManager

**Especificación:**
> "Supervisa @Senior Developer (performance) y @Prompt Engineer (documentación)"

**Patrón de implementación:**
```css
/* Mobile-first approach */
.container {
  width: 100%;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
    padding: 1.5rem;
  }
}
```

---

#### Tarea 2.2: Optimización de Assets para Performance
**Criterio de Aceptación:**
- [ ] Convertir imágenes a formatos modernos (WebP para fotos, SVG para iconos)
- [ ] Implementar lazy loading en imágenes y iframes (`loading="lazy"`)
- [ ] Minificar CSS y JS en producción (usar toolchain configurado)
- [ ] Validar que:
  - Total tamaño assets < 500KB (sin contar fuentes)
  - Imágenes principales no > 200KB
  - No hay imágenes de tamaño duplicado
- [ ] Cobertura de pruebas en Jest incrementada en +15%

**Especificación:**
> "Trabajar con @Senior Developer para implementar optimizaciones verificables"

---

### Día 3: Integración y Validación Cruzada

#### Tarea 3.1: Integración con Cambios de Accessibilidad
**Criterio de Aceptación:**
- [ ] Revisar PRs de @Compliance Auditor y @Senior Developer
- [ ] Integrar cambios de accesibilidad:
  - Contrast ratio ≥4.5:1 para texto normal
  - Navegación por teclado funcional (tab order)
  - ARIA labels para elementos interactivos
- [ ] Resolver conflictos de merge manualmente con commits atómicos
- [ ] Validar con WAVE Tool que no haya errores críticos

**Especificación:**
> "Revisa integración y PRs cruzados. Valida que no haya conflictos críticos"

**Checklist de validación:**
- [ ] Todos los links son accesibles por teclado y abren correctamente
- [ ] Videos tienen controles y transcripciones
- [ ] Formularios tienen mensajes de error accesibles
- [ ] Estructura HTML semántica (<header>, <main>, <footer>, landmarks)

---

#### Tarea 3.2: Pruebas Cross-Browser/Cross-Device
**Criterio de Aceptación:**
- [ ] Validar en al menos 3 navegadores: Chrome, Firefox, Safari
- [ ] Testear en 3 dispositivos reales:
  - Mobile: iPhone 12 (Safari/Chrome)
  - Tablet: iPad Air (Chrome/Firefox)
  - Desktop: MacBook Pro 16"
- [ ] Generar video de scroll suave en mobile: `entregables/refactor-responsividad-performance/video-scroll-mobile.mov`
- [ ] PR actualizado con notas de testing

**Especificación:**
> "Incluye video-scroll-mobile.mov (validación manual)"

---

### Día 4: Validación Final y Documentación

#### Tarea 4.1: Informe Técnico de Frontend
**Criterio de Aceptación:**
- [ ] Crear sección para `__informe-tecnico-frontend.md` dentro de estructura de entregables:
- **Secciones requeridas:**
  ```markdown
  ## Mejoras Implementadas - Responsividad
  
  ### Antes del Refactor
  - Breakpoints definidos: [listar]
  - Problemas identificados: [listar con screenshots]
  - Métricas Lighthouse iniciales: [adjuntar informe]
  
  ### Despúes del Refactor
  - Breakpoints actualizados: [listar nuevos]
  - Soluciones implementadas: [detallar cada cambio]
  - Dispositivos validados: [lista completa]
  
  ### Diff de Código Principal
  ```bash
  git diff --stat src/css/ src/js/ src/components/
  ```
  ```diff
  + @media (max-width: 480px) {
  +   .hero-section { padding: 0.5rem; }
  + }
  ```
  
  ### Métricas Logradas
  - Lighthouse Performance: XX/100 → XX/100
  - Lighthouse SEO: XX/100 → XX/100
  - Accesibilidad: XX/100 → XX/100 (validado con @Compliance Auditor)
  ```
- [ ] Adjuntar:
  - Antes/After Lighthouse screenshots
  - diff-principal.patch reducido a cambios de frontend
  - Capturas de navegação por teclado
  - Informe WAVE Tool

**Especificación:**
> "Informe de Auditoría Técnica (PDF) con métricas pre/post, problemas detectados + soluciones"

---

#### Tarea 4.2: Diagrama de Arquitectura - Frontend
**Criterio de Aceptación:**
- [ ] Crear `diagrama-arquitectura.md` en formato Mermaid con:
  ```mermaid
  flowchart TD
      A[gambito700.github.io] --> B{Responsive Design}
      A --> C[Accesibilidad WCAG 2.1]
      A --> D[Performance Optimizada]
      B --> B1[Mobile-First CSS]
      B --> B2[Media Queries]
      C --> C1[Contraste ≥4.5:1]
      C --> C2[ARIA Attributes]
      C --> C3[Keyboard Navigation]
      D --> D1[Lazy Loading]
      D --> D2[Asset Optimization]
      D --> D3[Minificación]
  ```
- [ ] Guardar imagen escalable: `diagrama-arquitectura.png` en misma carpeta
- [ ] Crear `leyenda-ejecutiva.txt` con descripción textual de 1 párrafo

**Especificación:**
> "Diagrama Ejecutivo: diagrama-arquitectura.png + diagrama-arquitectura.md + leyenda-ejecutiva.txt"


---

### Día 5: Pruebas Finales y Cierre

#### Tarea 5.1: Validación de Métricas y Sign-Off
**Criterio de Aceptación:**
- [ ] Ejecutar Lighthouse audit final:
  - Requiere ≥95/100 en Performance, SEO, Accesibilidad
  - Validar con herramientas externas (WebPageTest) si es posible
- [ ] Correr `npm run test` y validar 80% coverage mínimo
- [ ] Ejecutar Cypress: `npm run e2e` - todos tests deben pasar
- [ ] Firmar PR final a `main` con comentarios:
  ```
  ## Merge Checklist ✅
  - [x] Lighthouse Performance: 96/100
  - [x] Lighthouse SEO: 98/100  
  - [x] Lighthouse Accesibilidad: 97/100
  - [x] Cypress: 85% coverage, todos tests pasan
  - [x] WAVE Tool: 0 errores críticos
  - [x] Cross-browser testing: Chrome, Firefox, Safari
  - [x] Mobile testing: iPhone, iPad, Android
  ```

**Especificación:**
> "PR final a `main` con todos los cambios integrados"
> "Métricas: Valida y firma informes: Lighthouse (antes/después)"

---

#### Tarea 5.2: Entregables y Etiquetado
**Criterio de Aceptación:**
- [ ] Crear estructura final en `/entregables/refactor-responsividad-performance/` con:
  ```
  entregables/
  └── refactor-responsividad-performance/
      ├── diff-frontend.patch
      ├── lighthouse-audit-despues.pdf
      ├── video-scroll-mobile.mov
      ├── __informe-tecnico-frontend.md
      └── frontend-documentacion.pdf (opcional: resumir informe técnico)
  ```
- [ ] PR mergeado a `main` etiquetado con versión `v1.1.0-audit-2026`
- [ ] Notificar a @SeniorProjectManager vía async informe con:
  - % completado: 100%
  - Riesgos: None
  - Decisiones técnicas tomadas
  - Próximos pasos (si aplica)

**Especificación:**
> "Etiquetado de versión (ej: `v1.1.0-audit-2026`)"

---

## Reglas Críticas y Estándares

### Coding Standards (Basado en especificaciones previas)
- **CSS Framework:** Tailwind CSS (si está especificado) o CSS personalizado mínimo
- **JavaScript:** Usar ES6+, evitar jQuery
- **Animaciones:** Preferir CSS Transitions/Transforms, evitar JavaScript pesado
- **Componentes:** Solo usar FluxUI disponibles según stack

### Testing Mandatorio
- **Jest:** 80% coverage mínimo en:
  - Unit tests para componentes
  - Tests de funciones utilitarias
- **Cypress:** 100% integración con flujos críticos:
  - Navegación principal
  - Formularios
  - Accesibilidad (tab order, contrast)

### Documentación Requerida
- Todos los PRs deben incluir:
  - Problema identificado
  - Solución implementada
  - Screenshots o grabaciones si aplica
  - Validación realizada

### Métricas de Calidad
- **Coverage:** 80% Jest, 100% Cypress
- **Accesibilidad:** 0 errores críticos en WAVE/axe
- **Responsividad:** 100% funcional en ≥3 breakpoints
- **Performance:** No introducir regresiones medibles

---

## Stack Tecnológico Extraído de Especificaciones
**Frontend:**
- **CSS Framework:** Tailwind CSS (validar en configuración)
- **JavaScript:** ES6+ (evitar frameworks pesados si no están especificados)
- **Animación:** CSS preferido, GSAP solo si está en spec
- **Testing:** Jest + Cypress (80% coverage requerido)
- **Validación:** Lighthouse CI, WAVE, WebPageTest

**Integraciones Obligatorias:**
- GitHub Actions para CI/CD (métricas automáticas)
- FluxUI components para componentes reutilizables
- Laravel/Livewire solo si está especificado en stack base

---

## Riesgos y Mitigaciones Específicos para Frontend

### Riesgo 1: Conflictos en Media Queries con cambios de otros equipos
**Plan:**
- Usar unidades relativas (rem) consistentemente
- Pre-definir breakpoints en variables CSS:
  ```css
  :root {
    --breakpoint-sm: 576px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 992px;
  }
  ```
- Revisar PRs de accesibilidad y performance antes de mergear

### Riesgo 2: Caída de métricas por cambios de accesibilidad
**Plan:**
- Colaborar estrechamente con @Compliance Auditor en implementaciones
- Priorizar cambios que mejoren accesibilidad SIN afectar performance
- Validar con Lighthouse en cada PR

### Riesgo 3: Problemas de assets optimizados en CI/CD
**Plan:**
- Cache busting configurado automaticamente (hash en filenames)
- Validación de imágenes en GitHub Actions:
  ```yaml
  - name: Validate Images
    run: |
      find src/assets/images -name "*.{jpg,jpeg,png}" -exec img-opt --quality 80 {} \;
  ```

---

## Patrones de Éxito de Proyectos Anteriores

### Patrón 1: Commits Atómicos
**Formato:**
```
git commit -m "fix(responsividad): ajustar padding en mobile header"
```
**Regla:** Un cambio, un commit. Descripción clara de problema y solución.

### Patrón 2: PRs con Evidence
**Estructura obligatoria:**
```markdown
## Problema
[Descripción clara con screenshots BEFORE/AFTER]

## Solución
[Explicación técnica de cambios]

## Validación
- [ ] Lighthouse: XX/100 → XX/100
- [ ] WAVE Tool: 0 critical errors
- [ ] Cypress: 85% coverage
- [ ] Cross-browser: Chrome ✅, Firefox ✅, Safari ✅
```

### Patrón 3: Documentación Just-in-Time
- Documentar cambios DURANTE la implementación, no después
- Usar formato markdown con headers claros
- Incluir diagramas Mermaid si ayuda a entender arquitectura

---

## Criterios Finales de Aceptación - @frontend
✅ **Métricas Lighthouse:** ≥95/100 en Performance, SEO, Accesibilidad
✅ **Pruebas:** 80% coverage Jest + 100% Cypress pasan
✅ **Accesibilidad:** 0 errores críticos (WAVE/axe)
✅ **Responsividad:** Funcional en 3 breakpoints mínimo
✅ **Documentación:** Todos entregables creados y validados
✅ **Código:** Commits atómicos, PRs aprobados, mergeado a main
✅ **Requisitos:** Tallados según especificación oficial sin lujo/premium

**Nota Final:**
> Este es el proceso crítico para el éxito del sprint. Cada tarea debe ser accionable en 30-60 minutos. Reportar bloqueos INMEDIATAMENTE al @SeniorProjectManager para escalar al @Agents Orchestrator si es necesario.

---

## Checklist Rápido para @frontend
- [ ] Branch `refactor/responsividad-performance` activa y sincronizada
- [ ] PRs con formato correcto (`fix:`, `perf:`, `docs:`)
- [ ] Pruebas pasan en CI/CD
- [ ] Aprobaciones de @Compliance Auditor obtenidas
- [ ] Métricas documentadas (screenshots/lighthouse-\n- [ ] Entregables en carpeta correcta con estructura clara
- [ ] Comunicación async diaria enviada a @SeniorProjectManager

---

**Supervisor:** SeniorProjectManager
**Última actualización:** 2026-06-13
**Versión:** 1.0 
**Stack Validado:** Tailwind CSS, ES6+, Jest, Cypress, FluxUI