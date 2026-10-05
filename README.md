# Portfolio Profesional e Interactivo — Hugo Signes Sisternes

Repositorio oficial con el código fuente del sitio web personal y portfolio académico, desarrollado como proyecto integral para la marca personal y la excelencia técnica[cite: 1].

- **Autor:** Hugo Signes Sisternes
- **Perfil Técnico:** Desarrollo de Aplicaciones Multiplataforma (DAM), Sistemas y Redes (SMX) e Inteligencia Artificial (IA).

---

## 🚀 Descripción del Proyecto

El sitio web está concebido como una plataforma interactiva, de alto rendimiento y con una identidad visual propia muy marcada[cite: 1]. Recoge la trayectoria académica en **SMX**, la experiencia internacional **Erasmus en ESSEPI Tech (Italia)**, proyectos de emprendimiento social como *Volver a Encender* (The Challenge) y los estudios actuales en **1º de DAM**.

### ✨ Características Principales y Rúbrica

1. **Sistema de Temas y Estilos Dinámicos:**
   - Selector en tiempo real con persistencia de estado mediante `localStorage` y sincronización por parámetros URL.
   - **4 Estilos Visuales Únicos:** *Único* (Yveltal/Oscuro), *Profesional* (Corporativo/Serif), *Gamer* (Estética clásica Undertale) y *Retro* (Arcade CRT Pixelado).
   - Modo Claro y Oscuro adaptativo con transiciones fluidas.

2. **Interactividad Avanzada y Consumo de API Externa:**
   - **Integración con la API REST de GitHub:** Consumo asíncrono en tiempo real (`fetch`) de repositorios públicos, renderizados de forma dinámica en tarjetas adaptadas al diseño web.
   - Terminal simulada interactiva con efecto máquina de escribir, roadmap con progreso animado, pestañas modulares y efectos de cursor personalizados.

3. **Canal de Contacto Funcional:**
   - Formulario de contacto integrado con validación nativa, retroalimentación de estados de envío y protección antispam (*honeypot*).

4. **Calidad Técnica y Accesibilidad (WCAG):**
   - HTML5 semántico estructurado en páginas independientes (`index.html`, `sobre.html`, `trabajo.html`, `gusta.html`, `futuro.html`, `contacto.html`).
   - Hojas de estilo organizadas mediante **Variables CSS (Tokens)**.
   - Accesibilidad estricta: enlaces de salto rápido (`skip links`), soporte completo de navegación por teclado y visibilidad de foco optimizada (`:focus-visible`).

---

## 🛠️ Estructura del Repositorio

- `index.html` — Página principal de presentación y entrada a la web.
- `sobre.html` — Perfil personal, biografía y valores técnicos.
- `trabajo.html` — Hitos profesionales, hitos de SMX, Erasmus y The Challenge.
- `gusta.html` — Bento grid inmersivo con intereses, música, videojuegos y stack tecnológico.
- `futuro.html` — Proyección profesional hacia la Inteligencia Artificial y hoja de ruta.
- `contacto.html` — Formulario de contacto directo y enlaces corporativos.
- `styles.css` — Sistema de estilos centralizado con diseño *responsive* real.
- `script.js` — Lógica modular para la interactividad, manejo de temas y consumo de la API de GitHub.

---

## 💻 Decisiones de Arquitectura (ADR Resumido)

1. **Vanilla JavaScript Modular:** Se ha prescindido de frameworks pesados para garantizar un rendimiento óptimo en Lighthouse, tiempos de carga mínimos y control total sobre el DOM mediante funciones autoejecutables (`IIFE`) y observadores de intersección (`IntersectionObserver`).
2. **Consumo Asíncrono de API:** La conexión con la API de GitHub se implementa de manera desacoplada, asegurando una degradación elegante (*graceful degradation*) si el usuario se encuentra offline o se superan los límites de peticiones públicas.
