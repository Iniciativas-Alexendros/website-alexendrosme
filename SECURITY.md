# Política de seguridad de mi-website-personal

## Versiones soportadas

| Versión        | Soporte de seguridad |
| -------------- | -------------------- |
| última estable | sí                   |
| previa estable | parches críticos     |
| anteriores     | no                   |

## Reportar una vulnerabilidad

**No abras un issue público** para reportar vulnerabilidades. Hazlo por
canal privado a security@alexendros.me. Cifra el mensaje con la clave PGP
publicada en el directorio Web Key Directory (PENDIENTE_PUBLICAR_WKD, accesible
vía `gpg --auto-key-locate wkd --locate-key security@alexendros.me`).

Incluye en el reporte:

- Descripción del problema y posible impacto.
- Pasos para reproducir o prueba de concepto.
- Versiones afectadas.
- Cualquier mitigación temporal conocida.

## SLA de respuesta

- Acuse de recibo: 72 horas hábiles.
- Evaluación inicial: 7 días naturales.
- Resolución o plan de mitigación: 30 días naturales (90 días para
  vulnerabilidades complejas que requieran reescritura).

## Divulgación coordinada

Trabajamos contigo para coordinar la divulgación. Si la vulnerabilidad es
explotable activamente publicaremos el aviso de seguridad lo antes posible
sin comprometer las personas usuarias.

## Reconocimiento

Reconocemos públicamente a quienes nos ayudan a mejorar la seguridad
salvo que solicitéis lo contrario.

## Marco normativo aplicable

Este proyecto se desarrolla y mantiene desde España. La política de
divulgación responsable se inspira en lo previsto en el Reglamento
General de Protección de Datos (Reglamento (UE) 2016/679, RGPD, art. 33
y 34) y en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad
de la Información y de Comercio Electrónico (LSSI-CE) cuando aplique.

Para consultas no urgentes y solicitudes de información sobre seguridad
del proyecto: security@alexendros.me.

## Trade-offs de seguridad conocidos

### Content-Security-Policy: `unsafe-inline` en `script-src`

El sitio usa `script-src 'self' 'unsafe-inline'` en la cabecera CSP. Esto
es una excepción al principio de defensa en profundidad, pero es
**necesaria y aceptada** por las siguientes razones:

- **Next.js RSC requiere scripts inline**: React Server Components
  serializa el árbol de componentes en scripts inline (`self.__next_f.push(...)`)
  para hidratación client-side. Next.js 16 no soporta nonces automáticos
  para estos scripts.
- **Superficie de ataque mínima**: el sitio es 100% estático (export HTML),
  no hay input de usuarios, no hay forms, no hay comentarios, no hay
  API routes. No existe vector de inyección XSS runtime.
- **Los scripts inline son generados en build time**: todo el JavaScript
  embebido en el HTML es producido por `next build`, no por datos
  de usuario ni contenido dinámico.

**Si en el futuro se añadiese input de usuario** (comentarios, forms,
búsqueda), este trade-off debería reevaluarse y migrarse a un framework
que soporte nonces o eliminar `unsafe-inline`.
