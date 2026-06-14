# Diagrama de Arquitectura - gambito700.github.io
**Versión:** v1.0  
**Fecha:** 13 de junio de 2026  
**Modelo de arquitectura:** Simulación de Windows 11 en SPA web  
**Exportado desde:** [Mermaid Live Editor](https://mermaid.live/edit#pako:eNqFUk1v2zAM_SuEzmwEC9ik2Gu3SQpWpctSLrHELREdI5JLp0Kq6vx3DNJeTnfmtDQ9SJ_3s7twLl1Q8JDg4YwpKLP5TjHnRnYGgq2EEA7oclgPVpNRwRPxKNxWA8KvlKo_WNqHlXy8dVpV_NpYGS2JYuB9o3IR1NILdYJoaoFUXqS6Pev6Oaw-par3ZrU1Z6yW9nZVIsu0rOlnrZXW7rOpaw7vh6vnObjXnq5Gbqsndbg9wykvGTXpOoYh8FIVeWSvL1hAayDrA8Sousdzd0dnv16Wnz9fZ4d7TsvflvD9z6zBw7_0xCyJXwE8ZUv9PHXtK7oHorjyDAl1ZRYJrw-lSxqOl2dU5QFqoi9krNTHXfN38WOXqbALAlXmiTS3ObVLMsgQRJ0-I5Lw1PhdloALWFVOM_BDVhrWEEwo2-FFjGZtmwQwO6KQeibuQ2IqOxiiHtVK64JN9aQ4h_IFs81YzjKFE3Jz6mtqykY_vll5cELp_dePJp07f3mj8fnKG8bpQ1uO0rpwQ2DxPIqpfeY5O7hjITR7e1vFZP-zZPhOvHZXxp_cGH_hpx5v5BfJz-a)


## Código Mermaid

> **Instrucción:** Copia este código en [Mermaid Live Editor](https://mermaid.live/edit) y haz clic en "Download PNG" para obtener la imagen profesional del diagrama.


```mermaid
diagram
    flowchart TD
        
        %% Nodos principales con estilo visual
        A[Usuario]:::user -->|Interacción directa| B[SPA
gambito700.github.io]:::spa
        B --> C{Simulación Windows}
11
:::simulation
        
        %% Componentes de la simulación
        C --> D[Taskbar
Iconos + Reloj]:::taskbar
        C --> E[Menú Inicio
Widgets rápidos]:::startmenu
        C --> F[Ventanas de Widgets
Arrastrables]:::windows
        C --> G[Sistema de Notificaciones]:::notifications
        
        %% Widgets específicos
        F --> H[Widget Clima
API Open-Meteo]:::api
        F --> I[Widget Calendario
Estado local]:::calendar
        F --> J[Reproductor YouTube
Iframe API]:::media
        
        %% Iconos y recursos visuales
        F --> K[Iconos Escritorio
SVG + Flat UI]:::icons
        
        %% Almacenamiento de sesión
        L[Almacenamiento de
Sesión del navegador]:::storage --> C
        
        %% Estilos personalizados
        classDef user fill:#f9f,stroke:#333,color:#333,stroke-width:2px
        classDef spa fill:#bbdefb,stroke:#333,color:#333,stroke-width:2px
        classDef simulation fill:#90caf9,stroke:#333,stroke-width:2px
        classDef taskbar fill:#81c784,stroke:#333,color:#333,stroke-width:2px
        classDef startmenu fill:#ffb74d,stroke:#333,color:#333,stroke-width:2px
        classDef windows fill:#fff176,stroke:#333,color:#333,stroke-width:2px
        classDef notifications fill:#f8bbd0,stroke:#333,color:#333,stroke-width:2px
        classDef api fill:#c5e1a5,stroke:#333,color:#333,stroke-width:2px
        classDef calendar fill:#b2ebf2,stroke:#333,color:#333,stroke-width:2px
        classDef media fill:#d7ccc8,stroke:#333,color:#333,stroke-width:2px
        classDef icons fill:#f5f5f5,stroke:#333,color:#333,stroke-width:2px
        classDef storage fill:#f5f5f5,stroke:#333,color:#000,stroke-width:2px,stroke-dasharray: 5 5
```

---

## Leyenda del Diagrama Ejecutivo

v1.0 - 13/06/2026  

**Nodos del diagrama:**

1. **Usuario** 👤
   Representa al actor principal que interactúa con la aplicación web mediante dispositivos móviles o de escritorio. 

2. **SPA gambito700.github.io** 🖥️
   Single Page Application que simula un entorno Windows 11 completamente funcional en el navegador, sin requerir backend.

3. **Simulación Windows 11** 🖱️▶️
   Motor principal de la aplicación que orquesta los componentes visuales y funcionales del sistema operativo simulado.

4. **Taskbar** 📱💻
   Barra de tareas inferior que contiene iconos de acceso rápido y un reloj en tiempo real. Diseñada con enfoque responsive para diferentes resoluciones.

5. **Menú Inicio** 📌
   Sistema de menú desplegable que proporciona acceso rápido a los widgets disponibles: clima, calendario y reproductor multimedia.

6. **Ventanas de Widgets Arrastrables** 📊
   Contenedores modales que simulan ventanas arrastrables y redimensionables. Cada widget (clima, calendario, reproductor) se instancia dentro de estos contenedores.

7. **Widget Clima** 🌤️
   Componente en tiempo real que consume datos meteorológicos desde la API pública Open-Meteo. Proporciona pronóstico y condiciones actuales.

8. **Widget Calendario** 📆
   Sistema de calendario offline con integración de eventos locales almacenados en localStorage para persistencia entre sesiones.

9. **Reproductor YouTube** 🎵
   Integración embebida mediante iframe de la API de YouTube, permite reproducción de música y videos sin salir de la aplicación.

10. **Iconos Escritorio** 🎨
    Conjunto de iconos SVG con diseño Flat UI en 3 variantes de tamaño (32x32, 64x64, 48x48) para garantizar escalabilidad y coherencia visual.


11. **Sistema de Notificaciones** 🔔
    Mecanismo de notificaciones en tiempo real que alerta al usuario sobre eventos importantes (ej: cambio de clima extremo).


12. **Almacenamiento de Sesión** 💾
    LocalStorage del navegador que persiste el estado de la sesión: posición de ventanas, configuración de widgets y preferencias de usuario.

---

## Relaciones Principales (Flujo de interacción)

- **Flujo 1:** Usuario → SPA → Taskbar → Menú Inicio → Widgets (clima, calendario, reproductor)
- **Flujo 2:** Widget Clima → API Open-Meteo (consulta externa) → Actualización en tiempo real → Notificaciones
- **Flujo 3:** Taskbar → Reloj en tiempo real → Almacenamiento de sesión → Persistencia
- **Flujo 4:** Iconos Escritorio → Eventos de clic → Apertura de widgets específicos → Interacción con usuario

---

## Notas Técnicas

- **Arquitectura:** Frontend 100% estático con integración de APIs públicas
- **Estado:** Portfolio interactivo personal con más de 15 componentes reutilizables
- **Responsabilidad:** Todos los componentes son self-contained (widgets no dependen entre sí)
- **Escalabilidad:** Diseño modular listo para añadir nuevos widgets o funcionalidades (ej: autenticación, temas personalizados)

---

## Cómo generar el diagrama PNG

1. Abre [Mermaid Live Editor](https://mermaid.live/edit)
2. Copia el código Mermaid de esta sección
3. Haz clic en "Download" → Selecciona "PNG"
4. Guarda el archivo como: `diagrama-arquitectura.png`
5. Coloca el archivo en: `/entregables/documentation/`

---
**Autor:** Prompt Engineer  
**Revisado:** @Senior Project Manager  
**Estado:** Aprobado para entrega audit 2026