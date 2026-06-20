<div align="center">

# alexendros.me

**Un espacio personal sin precio.**<br>
Aquí no se vende, no se mide, no se captura.<br>
Lo comercial vive en otro sitio. Aquí vive lo que pienso.

<br>

[leer →](https://alexendros.me) · [código fuente ↓](#bajo-el-capó)

</div>

---

## Qué es esto

Un sitio web personal que existe para una sola cosa: **publicar ideas sin ánimo
de lucro, sin tracking y sin intermediarios**. No hay banner de cookies porque no
hay cookies que consentir. No hay analytics porque no necesito saber cuántos sois
ni de dónde venís. No hay formulario de captación porque no tengo nada que
venderte aquí.

El dominio `alexendros.me` es el espacio **libre de dinero** de Alejandro
Domingo Agustí. Lo ideológico, lo filosófico, lo nacional, lo social. Si buscas
contratación, producto o servicios, eso vive en
[alexendros.dev](https://alexendros.dev) — otro dominio, otra lógica, otro
registro.

## Por qué es público

Porque predicar transparencia y trabajar en privado es una contradicción. El
código de este sitio es la prueba de lo que afirma:

- **Cero tracking** — verificable en el código: ni un solo script de analytics,
  ni un píxel, ni un `localStorage`. Las únicas cookies son técnicas
  (`__cf_bm` anti-bot de Cloudflare, `_vercel_no_cache` de caché en desarrollo).
  Compruébalo tú mismo: `DevTools → Application → Cookies`.

- **Cero monetización** — sin afiliados, sin ads, sin "contenido patrocinado".
  Este dominio no genera ingresos y no pretende hacerlo.

- **Cero dependencia de plataforma** — HTML estático servido desde CDN. Si
  Vercel desaparece mañana, el sitio se sirve desde cualquier otro sitio en
  minutos. Sin vendor lock-in, sin base de datos, sin funciones serverless.

## El manifiesto técnico

La arquitectura del sitio **es** el argumento: se puede construir una presencia
web funcional, rápida y accesible sin rastrear a nadie, sin pedir permisos que no
necesitas y sin depender de infraestructura que no controlas.

| Decisión                         | Por qué                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Static export (HTML puro)        | No necesito servidor. Un CDN basta. Menos superficie de ataque, menos coste, más resiliencia.                                   |
| Sin analytics                    | Si no vendo nada aquí, no necesito medir conversiones. La vanidad de "saber cuánta gente me lee" no justifica rastrear a nadie. |
| Sin cookies de terceros          | El navegador de quien me lee no es mío. No le instalo nada que no sea estrictamente necesario para que la página funcione.      |
| Sin JavaScript innecesario       | El contenido se lee sin JS. Los componentes interactivos son progresivos.                                                       |
| Headers de seguridad endurecidos | CSP estricta, HSTS con preload, X-Frame-Options DENY. No porque lo exija nadie: porque es lo correcto.                          |
| Dark-first                       | Porque paso más horas delante de una pantalla de las que son sanas, y no voy a castigar los ojos de quien me lea.               |

## Bajo el capó

Para quien quiera ver **cómo** está hecho, no solo **qué** dice:

```
app/            Rutas (Next.js 16 App Router) — export estático
  styles/       Tokens oklch, tipografía, componentes, motion, breakpoints
  legal/        Aviso legal · Privacidad · Cookies (textos reales, no lorem ipsum)
components/     Nav, footer, efectos visuales, shadcn/ui inline (6 componentes)
lib/            Config del sitio, JSON-LD, utilidades
content/        Ensayos e ideas en MDX (en construcción)
docs/           ADRs, changelog, plan de reconversión
public/         Fuentes locales, OG image, sitemap, robots
```

### Stack

| Capa       | Elección                                               |
| ---------- | ------------------------------------------------------ |
| Framework  | Next.js 16 · App Router · React 19 · TypeScript strict |
| Estilos    | Tailwind CSS v4 (CSS-first) · tokens oklch dark-first  |
| Tipografía | Geist Sans + Mono (self-hosted) · Inter display        |
| Calidad    | ESLint flat · Prettier 3 · depcheck · ts-prune         |
| Deploy     | Vercel (mad1) — static export, CDN edge                |

### Arrancar en local

```bash
pnpm install
pnpm dev            # localhost:3000 (Turbopack)
pnpm build          # genera out/ — HTML estático
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
```

## Sobre la página de cookies

Este sitio tiene una página de cookies que **no existe para cumplir un trámite**,
sino para explicar lo que la mayoría de sitios prefiere que no entiendas: qué son
las cookies de verdad, para qué se usan tus datos y por qué el banner que te
persigue por internet no te protege — te domestica.

La puede leer cualquiera. No hace falta ser técnico.

## Estado

En reconversión activa. El `.me` está dejando atrás su fase de landing comercial
para convertirse en lo que siempre debió ser: un espacio de contenido propio,
libre de la lógica del dinero. Plan completo en
[`docs/adr/0002-reconversion-me-antidinero.md`](docs/adr/0002-reconversion-me-antidinero.md).

## Licencia

Pendiente de decisión formal. El código fuente del sitio y su contenido textual
se publicarán bajo una licencia abierta (previsiblemente Creative Commons).
Mientras tanto: puedes leer, inspeccionar y aprender de este código. Si lo
reutilizas, cita la fuente.

## Contacto

[contacto@alexendros.me](mailto:contacto@alexendros.me)

<div align="center">
<br>

Hecho en Valencia · sin cookies · sin precio · sin prisa

</div>
