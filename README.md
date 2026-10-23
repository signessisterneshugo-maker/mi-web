# Portfolio personal de Hugo Signes Sisternes

## Descripción general

Este proyecto consiste en un portfolio web personal desarrollado como una experiencia digital narrativa y técnica, no como un simple currículum estático. La idea principal ha sido combinar identidad visual, contenido personal, recorrido académico y profesional, y una capa de interactividad que convierta la web en una pieza más cercana a un producto digital que a una presentación clásica.

El sitio está pensado para presentar a Hugo Signes Sisternes como un perfil híbrido: técnico, creativo y orientado a la resolución de problemas con enfoque en desarrollo web, IA, sistemas y experiencias digitales innovadoras.

## Objetivo del proyecto

El objetivo es comunicar, de forma clara y atractiva, los siguientes puntos:

- perfil académico y profesional de Hugo;
- recorrido formativo desde SMX hasta DAM;
- intereses en programación, IA, desarrollo web y UX;
- capacidad para crear interfaces con personalidad y valor visual;
- capacidad para presentar un trabajo con enfoque de producto y no solo de contenido.

Se busca una mezcla de estética, funcionalidad, narrativa y muestra técnica.

## Público objetivo

La web está orientada principalmente a:

- profesores y tutores académicos;
- posibles clientes o empresas tecnológicas;
- evaluadores de proyectos de innovación y desarrollo;
- personas interesadas en perfiles híbridos entre diseño, tecnología y creatividad.

## Tecnologías utilizadas

El proyecto se ha desarrollado con tecnologías web estándar y sin un framework complejo, lo que facilita la comprensión del código y hace más visible el proceso de construcción.

- HTML5 para la estructura de cada página.
- CSS3 para el diseño, la identidad visual y la responsividad.
- JavaScript vanilla para las interacciones, navegación, selección de tema, chat IA y componentes dinámicos.
- GitHub API para intentar mostrar actividad pública del repositorio.
- Three.js y un entorno 3D para la experiencia interactiva del proyecto.
- Arquitectura multipágina para separar temas, contenido y narrativa.

## Arquitectura del proyecto

El proyecto se organiza como un sitio estático multipágina con una capa visual centralizada y lógica compartida en JavaScript.

### Principales decisiones de diseño

1. Arquitectura multipágina
   - Cada página responde a una necesidad narrativa distinta.
   - Esto ayuda a separar el contenido y evita que todo quede fusionado en una única vista.

2. Sistema visual único
   - La estética no depende de una sola plantilla.
   - Se ha construido una identidad visual con variables CSS, temas y estilos distintos que permiten adaptar la marca sin romper la estructura.

3. Interactividad real
   - El sitio incorpora chat IA, cosmética visual, animaciones y contenido dinámico para diferenciarlo del típico portafolio estático.

4. Evidencia de proceso
   - Se ha trabajado en documentar decisiones de arquitectura y mostrar entorno de actividad de GitHub/commits para reforzar la idea de trabajo continuo.

## Estructura de páginas

El sitio está compuesto por las siguientes páginas:

- index.html: página principal o landing, con narrativa, presentación visual y acceso rápido a secciones clave.
- sobre.html: perfil personal, recorrido formativo y presentación del autor.
- trabajo.html: trayectoria profesional y académica, además de evidencia de actividad y proyectos.
- gusta.html: intereses, referencias, gustos y personalidad creativa.
- como-funciona.html: explicación de la lógica del proyecto y de cómo se ha construido la web.
- futuro.html: visión de futuro, objetivos y relación con IA, producto digital y evolución profesional.
- contacto.html: formulario y vías de contacto.
- juego3D.html: experiencia 3D interactiva dentro de la web.
- device-knight.html: proyecto o recurso relacionado con la experiencia visual del sitio.
- programacion-ia.html: enfoque sobre IA, programación y desarrollo creativo.

## Organización del repositorio

```text
mi-web/
├── index.html
├── sobre.html
├── trabajo.html
├── gusta.html
├── futuro.html
├── contacto.html
├── como-funciona.html
├── programacion-ia.html
├── juego3D.html
├── device-knight.html
├── styles.css
├── script.js
├── juego3D.js
├── img/
│   └── yveltal.jpeg
├── assets/
├── sprites/
├── docs/
│   └── adr/
│       ├── 0001-portfolio-architecture.md
│       └── 0002-theme-system.md
├── README.md
├── PROMPTS_IMPORTANTES.md
├── notas.txt
└── ...
```

## Documentación técnica y decisiones de arquitectura

El proyecto incluye decisiones de arquitectura documentadas en la carpeta `docs/adr`.

### ADR 1: estructura multipágina
Explica por qué se eligió una organización por páginas en lugar de una sola vista de largo recorrido. La principal ventaja es la claridad narrativa y la separación de contenidos.

### ADR 2: sistema de temas y tokens visuales
Documenta la decisión de usar CSS con variables globales para colores, tipos, radios y sombras. Esto permite mantener una identidad visual consistente y adaptable.

## Proceso de creación del proyecto

El desarrollo del sitio no ha sido únicamente una tarea visual, sino un proceso iterativo de diseño, contenido, programación y refinado. El flujo general ha sido el siguiente:

### 1. Definición del objetivo
Se planteó la necesidad de crear un portfolio con personalidad, no un documento aburrido. La intención era transmitir un perfil más rico, más técnico y más creativo.

### 2. Estructura y arquitectura de información
Se dividió el contenido en páginas con función clara: presentación, perfil, trayectoria, intereses, IA, futuro y contacto. Esto ayuda a la navegación y a una experiencia más legible.

### 3. Diseño visual y marca
Se trabajó en una identidad visual con tonos oscuros, contrastes marcados, estética cyberpunk o institucional, y un sistema de estilo adaptable. La intención era que la marca se percibiera como algo propio y no genérico.

### 4. Interacciones y experiencia de usuario
Se añadieron detalles como:

- menú de navegación;
- selector de estilos y temas;
- cambio de calidad visual;
- chat IA;
- animaciones, overlays y capas visuales;
- estructura con elementos dinámicos para generar sensación de producto vivo.

### 5. Mejora del contenido y la narrativa
Se fueron refinando los mensajes para que no solo se explicara “qué hace Hugo”, sino también “por qué tiene valor este trabajo” y “qué recorrido le ha llevado a desarrollarse así”.

### 6. Integración de evidencia técnica
Se añadieron elementos como la sección de GitHub/commits, la documentación de decisiones y el esfuerzo por mostrar el proceso en lugar de solo el resultado final.

### 7. Ajustes responsivos y refinado final
Se trabajó específicamente en la experiencia móvil y en la legibilidad del contenido para que la navegación fuera fluida en distintos dispositivos.

## Cómo ejecutar el proyecto localmente

Desde la raíz del repositorio:

```bash
cd /home/hugsigsis/Documents/mi-web
python3 -m http.server 8000
```

Después, abre esta URL en el navegador:

```text
http://localhost:8000
```

## Observaciones para el profesor

Este proyecto se puede entender como una pequeña pieza de diseño y desarrollo web orientada a la presentación de un perfil técnico y creativo. La principal cualidad no es solo la estética, sino la capacidad de convertir contenido personal en una experiencia digital con intención, estructura y narrativa.

Se puede valorar especialmente:

- coherencia entre contenido, identidad visual y estructura de la web;
- uso de patrones de diseño y arquitectura clara;
- integración de tecnologías web modernas con enfoque práctico;
- esfuerzo por crear una interfaz que funcione como producto digital y no solo como página informativa;
- evolución del proyecto mediante documentación y mejora continua.

## Siguientes mejoras recomendadas

A pesar del buen resultado visual y funcional, el proyecto puede reforzarse aún más con:

- más evidencia de casos reales y proyectos concretos;
- más detalle sobre decisiones técnicas y solución de problemas;
- una trazabilidad de cambios más sólida en Git y documentación del proceso;
- mayor profundidad en terreno de IA, UX y rendimiento web.

## Archivo de prompts clave

Se adjunta una documentación adicional con los prompts más relevantes utilizados durante la construcción del proyecto:

- [PROMPTS_IMPORTANTES.md](PROMPTS_IMPORTANTES.md)

## Conclusión

Este portfolio refleja un enfoque de creación consciente, en el que se combina el trabajo de diseño, la programación, la narrativa y la capacidad de comunicar identidad profesional. El resultado no busca solo mostrar datos, sino construir una experiencia que permita entender mejor la forma de trabajar, pensar y proyectarse de Hugo Signes Sisternes.
