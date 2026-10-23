# ADR 0002: Sistema de temas y tokens visuales

## Estado
Aceptado

## Contexto
La web quiere tener identidad propia, pero también necesita mantener una base consistente y reutilizable. Debe poder cambiar de estilo sin romper la estructura general.

## Decisión
Se ha implementado un sistema basado en variables CSS con tokens para color, espaciado, radio, tipografías y sombras. Cada estilo se activa con un atributo `data-style` sobre el documento y cada tema con `data-theme`.

## Consecuencias
Ventajas:
- consistencia visual en todas las páginas;
- cambios rápidos de identidad sin reescribir el layout;
- mejor capacidad de testear variantes de marca.

Riesgos:
- requiere disciplina al crear nuevas clases y componentes;
- si se añaden estilos sueltos, se puede perder la coherencia del sistema.
