# ADR 0001: Estructura de sitio multipágina y contenido narrativo

## Estado
Aceptado

## Contexto
La web personal de Hugo necesita distinguirse de una plantilla genérica. Debe comunicar perfil académico, experiencia, intereses y contacto sin caer en un CV plano.

## Decisión
Se ha optado por una arquitectura multipágina, con cada página respondiendo a un eje claro del portafolio: inicio, perfil, trayectoria, intereses, IA, futuro y contacto.

Esto permite:
- mantener la narrativa sin sobrecargar una sola vista;
- separar contenido y estilo;
- facilitar la evolución con nuevas secciones o proyectos.

## Consecuencias
Ventajas:
- más claridad para visitar, entender y devolver información;
- mejor organización del contenido;
- un recorrido más comprensible para perfiles externos.

Riesgos:
- más trabajo de mantenimiento a nivel de consistencia visual;
- necesidad de revisar enlaces y tokens entre páginas.
