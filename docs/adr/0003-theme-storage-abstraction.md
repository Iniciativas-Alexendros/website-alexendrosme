# 0003. Storage de tema (theme): abstracción localStorage → IndexedDB-ready

- Estado: proposed
- Fecha: 2026-07-17
- Decisores: Alexendros
- Etiquetas: arquitectura, frontend, persistencia

> Texto en formato MADR 4.0.0 · https://adr.github.io/madr/

## Contexto y planteamiento del problema

La persistencia del tema (light/dark/system) vive hoy en `localStorage`,
gestionada directamente desde `components/theme-provider.tsx` (React
`useEffect` tras la migración del PR #110 — antes era un IIFE en
`public/theme.js`).

`localStorage` tiene tres problemas concretos para este caso:

1. **Modo privado / bloqueado**: navegadores en incognito desactivan
   `localStorage` cuando el sitio no es la pestaña activa;
   `localStorage.setItem` lanza `SecurityError` o `QuotaExceededError` y el
   tema cae al default del sistema sin que el toggle del usuario persista.
2. **Cuota**: 5–10 MB según navegador; irrelevante hoy para una sola clave,
   pero al introducir `preferences.md` (futuro esquema ampliado de
   preferencias) varias claves empezarían a sumar.
3. **Acoplamiento directo al DOM-storage concreto**: cualquier nuevo esquema
   (preferencias, últimos artículos visitados, etc.) tendría que re-pasar
   por esta misma decisión y duplicar `try/catch`.

Restricciones del repo: sitio **estático puro** (`output: 'export'`), **sin
backend**, dependencias mínimas y auditadas (`depcheck` en CI), TypeScript
`strict` con `noUncheckedIndexedAccess`.

## Drivers de la decisión

- Eliminar la regresión "modo privado → tema no persiste".
- Aislar el backend de persistencia del componente React para poder cambiar
  sin tocar el árbol de componentes.
- Dejar la puerta abierta al fichero `preferences.md` futuro con varias
  claves y posiblemente varios backends (síncrono + asíncrono) sin fricción.
- Minimizar bytes en el bundle activo: el cambio NO debe notarse en
  rendimiento aunque introduzca una dependencia.

## Opciones consideradas

- **A. Mantener localStorage con más `try/catch`** — un parche defensivo más
  sobre el código actual.
- **B. Migrar directo a IndexedDB con `idb-keyval`** — único commit que cambia
  el backend activo.
- **C. Abstracción de storage con flip-point diferido** — interfaz
  `ThemeStorage` asíncrona + dos adaptadores (`LocalStorageThemeStorage`
  activo, `IndexedDBThemeStorage` listo) + constante `THEME_STORAGE_BACKEND`
  como único cambio entre commits.
- **D. Adoptar `next-themes`** — librería battle-tested (~12kB gzip) que ya
  implementa este patrón y muchos otros detalles.

## Resultado de la decisión

Opción elegida: **"C. Abstracción de storage con flip-point diferido"**, porque:

- Resuelve (1) y (2) sin sacrificar la auditabilidad del proyecto: la
  dependencia añadida no se ejecuta en el camino activo (DCE verificado
  en `out/_next/static/chunks`).
- Hace la migración mecánica y segura: cambiar `localStorage` por
  `"indexeddb"` en una constante + añadir shim de copia única en una sola
  PR.
- Evita la sobre-dependencia de D (12kB constante) hasta que demuestre falta
  de la decisión propia.
- Encaja con la disciplina TDD del repo: 44 tests que cubren ambos
  adaptadores independientemente del flip-point.

### Consecuencias positivas

- Cambio de backend se hace con un commit literal de 1 línea cuando llegue
  el momento de atacar el modo privado en producción.
- Defensa en dos capas (`isTheme` predicate + filtrado en adaptador) blinda
  contra valores malformados sin importar el backend.
- Tests pueden ejercitar el adaptador IDB sin necesidad del navegador.
- Trazabilidad arqueológica: este ADR documenta el "por qué del cuándo" del
  flip.
- **Coste cero en bundle activo**: con `THEME_STORAGE_BACKEND = "localStorage"`
  verificado por DCE, `idb-keyval` queda tree-shaken del output
  (`grep -rE 'idb-keyval|createStore' out/_next/static/chunks` → 0 hits).
  El delta NEXT-PR estimado: **+~600 B min+gzip** en chunks de ruta cuando
  el flip se ejecute, dentro del slack existente en el budget
  `scripts <250 KB` del `lighthouserc.cjs`.

### Consecuencias negativas

- ~85 LOC de código nuevo en `lib/theme-storage.ts` para un cambio que NO es
  todavía user-observable.
- Una dependencia (`idb-keyval`) presente en `package.json` pero no
  ejercitada en el runtime actual. Se mitiga con DCE verificado y constante
  explícita en el código.
- Race window conocido: si el usuario hace click en ThemeToggle antes de
  que `themeStorage.get()` resuelva en mount, su cambio se descarta
  silenciosamente. Mitigable en el flip real (next PR) bloqueando el toggle
  hasta que `isLoaded` sea `true` o haciendo la lectura síncrona si el
  backend activo lo permite.

## Validación

- 82/82 tests vitest pasan en 8 ficheros (incluyendo 44 nuevos en
  `__tests__/lib/theme-storage.test.ts`).
- `tsc --noEmit` en modo `strict` + `noUncheckedIndexedAccess`: 0 errores.
- `eslint` + `prettier --check`: 0 errores.
- `next build` (export estático) termina en verde.
- DCE verificado: `grep -rE 'idb-keyval|createStore' out/_next/static/chunks`
  no devuelve resultados — la dependencia NO aparece en el bundle activo.
- Smoke en producción mantenido: las 13 rutas legítimas siguen sirviendo
  200; las 2 rutas bogus siguen devolviendo 404.

## Próximos pasos (NEXT-PR backlog)

Estos puntos quedan explícitamente fuera de esta PR y son la base del
siguiente commit cuando se decida atacar el problema del modo privado:

1. Cambiar `THEME_STORAGE_BACKEND` a `"indexeddb"` (1 línea).
2. Añadir shim de copia única en `IndexedDBThemeStorage.get()`: si IDB está
   vacío pero `localStorage.theme` tiene valor, copiar a IDB **y eliminar
   la clave localStorage solo después de que `idbSet` resuelva con éxito**
   (orden atómico: write-then-delete; nunca el inverso, para evitar perder
   el valor del usuario bajo un fallo de IDB transitorio). Garantiza que
   los usuarios actuales no pierden la preferencia en el primer load
   post-deploy.
3. Plantear tests E2E Playwright que cubran el toggle bajo modo privado
   (incognito en Chromium).
4. Generalizar `lib/storage.ts` (interfaz `KVStorage`) y migrar
   `components/anti-monetization-banner.tsx` (que también usa localStorage
   para persistir el "dismissed").

## Pros y contras de las opciones

### A. Mantener localStorage con más `try/catch`

- Bueno, porque es la opción más barata.
- Malo, porque no resuelve los problemas de fondo y deja el código más
  frágil.

### B. Migrar directo a IndexedDB

- Bueno, porque es el camino más corto al resultado final.
- Malo, porque acopla el bugfix a la introducción de una dependencia sin
  tests previos; cualquier regresión en IDB rompe el toggle sin red de
  seguridad.
- Malo, porque imposibilita rollback limpio sin re-git-history.

### C. Abstracción con flip-point diferido (elegida)

- Bueno, porque desacopla el cambio de comportamiento del cambio de
  estructura.
- Bueno, porque permite tests unitarios sobre ambos backends.
- Bueno, porque el coste de bytes en bundle activo es cero (DCE).
- Malo, porque añade código que no es user-observable hoy.

### D. Adoptar `next-themes`

- Bueno, porque es battle-tested y cubre muchos edge cases.
- Malo, porque sustituye ~80 LOC propios por 12kB de librería, alineándose
  con el principio antidinero solo si aporta más de lo que cuesta.
- Malo, porque delega el modelo de datos a decisiones upstream que pueden
  diverger de las del proyecto.

## Más información

- PR #110 (`refactor(theme): inline theme bootstrap into ThemeProvider
useEffect`): borró `public/theme.js` y dejó el bootstrap en
  `components/theme-provider.tsx`.
- `lib/theme-storage.ts`: implementación de la abstracción.
- `__tests__/lib/theme-storage.test.ts`: cobertura de ambos adaptadores +
  flip-point.
- `vitest.config.ts`: `environment: "happy-dom"` añadido para que
  `localStorage` esté disponible en tests.
- Hoja de ruta de preferencias: pendiente (`preferences.md` en
  `docs/`).
