# 🚀 Portfolio Profesional e Interactivo — Hugo Signes Sisternes

Repositorio del portfolio personal con enfoque académico y tecnológico. La web combina identidad visual propia, contenido contextualizado y una capa de interactividad para que funcione como una marca digital más que como un simple CV.

- Autor: Hugo Signes Sisternes
- Perfil técnico: DAM, SMX, IA y desarrollo web

---

## ✨ Qué está bien hecho

1. Arquitectura multipágina clara.
   - Hay una estructura por secciones y rutas distintas para presentar la identidad digital, la trayectoria, los intereses y el contacto.

2. Sistema visual completo.
   - La web incluye varias propuestas visuales y un selector de estilo con persistencia, lo que refuerza la idea de marca y la exploración del producto.

3. Interactividad y componente 3D.
   - El acceso a un metaverso, la capa de chat y la lógica de piezas dinámicas ayudan a diferenciarlo de una plantilla estática.

4. Contacto real.
   - El formulario habilita un flujo funcional con validación y fallback para correo.

---

## ⚠️ Qué seguiría mejorando según la rúbrica

La mayor diferencia está en estos puntos:

- Contenido más propio y específico en la home: todavía hace falta reforzar la narrativa con casos reales, problema → solución → resultado.
- Evidencia técnica más visible: conviene dejar claro el origen de cada decisión, no solo el resultado final.
- Proceso de iteración: el historial de commits y las decisiones tomadas deben quedar documentadas para sostener la parte de "git + evidencia de trabajo".

---

## 🧭 Decisiones de arquitectura y evidencia

Se recomienda documentar dos decisiones clave en el repositorio:

- ADR 1: mantener la interfaz en un CSS centralizado con tokens de color, tipo y espaciado para que todas las páginas compartan la misma identidad.
- ADR 2: separar la capa visual, la lógica de interacción y el contenido narrativo para facilitar mantenimiento y evolución del portfolio.

Puedes ver la referencia en la carpeta `docs/adr/`.

---

## 📁 Estructura del repositorio

```text
├── index.html        # Presentación principal y narrativa visual
├── sobre.html        # Bio y perfil personal
├── trabajo.html      # Trayectoria y proyectos
├── gusta.html        # Intereses y referencias
├── futuro.html       # Roadmap e IA
├── contacto.html     # Contacto y formulario
├── juego3D.html      # Entorno 3D
├── styles.css        # Estilos globales y sistema de temas
├── script.js         # Lógica, validación y UI
├── juego3D.js        # Motor 3D y experiencia inmersiva
├── docs/
│   └── adr/         # Decisiones históricas de arquitectura
├── README.md         # Esta guía de contexto
└── assets/           # Recursos y multimedia
```

---

## 🧪 Cómo probarlo localmente

```bash
cd /home/hugsigsis/Documents/mi-web
python3 -m http.server 8000
```

Luego abre `http://localhost:8000` en el navegador.

---

## 🔍 Qué haría yo como siguiente paso

1. Reforzar la home con un bloque de proyectos con contexto real.
2. Añadir una pequeña nota técnica en la web con dos decisiones de arquitectura y por qué se eligieron.
3. Mantener el historial de cambios con commits más atómicos y mensajes con sentido.
4. Revisar que el contacto real se explique claramente: qué ocurre al enviar el formulario y dónde llega el mensaje.
