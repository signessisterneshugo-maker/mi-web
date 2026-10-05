# 🚀 Portfolio Profesional e Interactivo — Hugo Signes Sisternes

Repositorio oficial del sitio web personal y portfolio académico, desarrollado bajo estrictos estándares de excelencia técnica, diseño modular y experiencias inmersivas avanzadas.

- **Autor:** Hugo Signes Sisternes  
- **Perfil Técnico:** Desarrollo de Aplicaciones Multiplataforma (DAM), Sistemas y Redes (SMX) e Inteligencia Artificial (IA).

---

## ✨ Características Principales & Criterios de Excelencia

1. **Arquitectura Multipágina Independiente:**
   - Estructura limpia y semántica compuesta por páginas especializadas: `index.html` (Inicio), `sobre.html` (Perfil), `trabajo.html` (Trayectoria y Hitos), `gusta.html` (Bento Grid de intereses), `futuro.html` (Proyección en IA y Roadmap) y `contacto.html` (Formulario funcional).

2. **Sistema Avanzado de Estilos y Temas Dinámicos:**
   - 4 estilos visuales independientes y con identidad propia: **Único** (Yveltal/Oscuro), **Profesional** (Corporativo con tipografía Serif), **Gamer** (Estética clásica estilo *Undertale*) y **Retro** (CRT Pixelado).
   - Selector en tiempo real con persistencia de estado mediante `localStorage` y sincronización completa de paletas de color con el entorno 3D.

3. **Consumo de API Externa (GitHub REST API):**
   - Integración asíncrona en tiempo real (`fetch`) con la API pública de GitHub para obtener y renderizar dinámicamente los repositorios y proyectos activos del autor.

4. **Metaverso 3D Interactivo (`juego3D.html` & `juego3D.js`):**
   - Entorno gráfico en 3D desarrollado con **Three.js** integrado mediante un botón de acceso exclusivo en la página de inicio.
   - **Controles en Primera Persona & Físicas:** Movimiento libre con teclado (`WASD`), rotación de cámara con el ratón (`PointerLockControls`), gravedad realista y salto con la barra espaciadora (`Space`).
   - **Sistema de Construcción y Destrucción Tipo Minecraft:** Colocación precisa de bloques tecnológicos pequeños (`1x1x1`) mediante cuadrícula (*grid snapping*) con clic izquierdo, y eliminación de estructuras con clic derecho.
   - **Portales Holográficos y Señalización:** Ciudad ciberpunk orgánica e irregular con carteles indicadores orientativos (situados en postes traseros para no obstaculizar la visión) y paneles holográficos flotantes interactivos situados en plazas abiertas que actúan como portales clicables hacia cada sección.

5. **Accesibilidad y Rendimiento (WCAG):**
   - Uso de tokens CSS mediante variables personalizadas.
   - Soporte completo para navegación por teclado, enlaces de salto rápido (`skip links`) y gestión de atributos ARIA.

---

## 📌 Historial de Actualizaciones (Changelog)

A continuación se detalla la cronología de mejoras técnicas implementadas en el desarrollo:

- **Fase 1: Reestructuración y Semántica (Arquitectura Base)**
  - Corrección y reconstrucción independiente de los 6 archivos HTML principales (`index`, `sobre`, `trabajo`, `gusta`, `futuro`, `contacto`) para garantizar una navegación fluida, eliminación de duplicidades y marcado activo correcto de pestañas.

- **Fase 2: Sistema Visual de 4 Temas**
  - Implementación de la hoja de estilos centralizada (`styles.css`) basada en tokens de variables CSS, soportando los temas *Único*, *Profesional*, *Gamer* y *Retro*, junto con persistencia en `localStorage`.

- **Fase 3: Datos Dinámicos (API Externa)**
  - Adición del módulo de consumo asíncrono (`fetch`) para la API REST de GitHub, permitiendo listar repositorios públicos en tiempo real de forma segura y tolerante a fallos.

- **Fase 4: Desarrollo del Metaverso 3D y Ciberciudad**
  - Creación de la vista `juego3D.html` y del motor gráfico `juego3D.js`.
  - Evolución del plano plano a una **gran ciudad irregular** con edificios asimétricos y distribución orgánica.
  - Sincronización automática de las paletas de color y niebla 3D con el estilo visual activo de la web.
  - Integración de **físicas de gravedad, colisión y salto**.
  - Programación de las mecánicas completas de **construcción (clic izquierdo)** y **destrucción (clic derecho)** de bloques escala `1x1x1` ajustados a rejilla.
  - Diseño de carteles orientativos con emojis y hologramas portales posicionados en áreas abiertas.

---

## 🛠️ Estructura del Repositorio

```text
├── index.html        # Página principal de presentación
├── sobre.html        # Perfil personal y biografía técnica
├── trabajo.html      # Experiencia (SMX, Erasmus en Italia, The Challenge, DAM)
├── gusta.html        # Bento grid con intereses, música y stack
├── futuro.html       # Terminal interactiva y roadmap hacia la IA
├── contacto.html     # Formulario de contacto y enlaces corporativos
├── juego3D.html      # Vista del entorno 3D y HUD del metaverso
├── styles.css        # Hojas de estilo centralizadas y sistema de temas
└── juego3D.js        # Motor gráfico 3D, físicas, colisiones y lógica de juego