# dsh-qnav

<div align="center">

[English](README.md) · [中文](README.zh-CN.md) · [日本語](README.ja-JP.md) · **Español** · [Français](README.fr.md)

</div>

---

### En una línea

Una barra lateral de navegación por preguntas en el borde derecho para conversaciones largas en DSH: cada pregunta real del usuario obtiene un indicador sobre el que pasar el cursor; haz clic para saltar directamente a esa ronda y la posición actual se resalta automáticamente mientras haces scroll.

### Instalación (tres pasos)

```bash
# 1. Clonar desde GitHub
git clone https://github.com/lin-nanxing/dsh-qnav.git
cd dsh-qnav

# 2. Construir (solo si modificas el código fuente)
npm run build

# 3. Un solo comando para montar en DSH
dsh plugin --profile web add link:.
```

> 💡 **¡No necesitas publicar en npm!**
> El prefijo `link:` le dice a DSH que instale desde una ruta local. Después de clonar, **solo ejecuta el paso 3 en el directorio del proyecto**.
>
> "Publicar en npm" significa subir tu paquete al registro público de npm para que otros puedan simplemente escribir `dsh plugin --profile web add dsh-qnav`. **Esto es opcional** — no afecta tu propio uso.

### Funciones clave

1. **Extracción precisa** — Lee preguntas reales del usuario desde los nodos DOM de conversación de DSH usando `data-chat-flow-kind="user"`, filtrando filas de steering/pending/contexto; incluye respaldo con `[class*="userRow"]`.
2. **Salto con referencia de elemento** — Guarda la referencia DOM de cada `flowItem` en lugar de coincidir por prefijo de texto; los clics llaman directamente a `scrollIntoView()`. Elimina errores de deduplicación, colisiones de prefijos y divisiones de nodos de texto por referencias @.
3. **Filtro automático de filas no válidas** — Excluye entradas no enviadas e inyecciones de sistema vía `data-pending-steering` y `data-chat-flow-kind`. Sin indicadores falsos vacíos.
4. **Distribución proporcional** — Los indicadores se colocan uniformemente a lo largo del borde derecho, adaptándose según la cantidad de preguntas.
5. **Modo oscuro** — CSS `color-scheme: light dark` + `@media (prefers-color-scheme: dark)` cambia el color de resaltado automáticamente con el tema de la página.
6. **Globo de ayuda flotante** — Al pasar el cursor muestra "N. <pregunta completa>" a la izquierda; los globos se anclan a la izquierda para evitar desbordamiento y miden dimensiones antes de posicionarse (sin parpadeo).
7. **Resaltado de posición actual** — Se actualiza mediante rectángulos de elementos (`getBoundingClientRect().top ≤ 120px`) en lugar de recorridos frágiles del árbol de texto, inmune a interferencia de citas en respuestas.
8. **Sincronización MutationObserver** — Reread y rerenderizado de indicadores ante cambios de contenido (debounce 500ms); el resaltado se actualiza cada 600ms.
9. **Seguridad HMR** — `apply(ctx)` devuelve un disposedor que limpia observadores, intervalos, DOM inyectado y hojas de estilo — sin fugas en reload o desactivación.

### Mejoras respecto al preload de escritorio

| Dimensión | Preload de escritorio `preload-nav.js` | Plugin `dsh-question-nav` |
|---|---|---|
| Entorno | Preload del shell Electron (solo escritorio) | Client web DSH (cualquier plataforma) |
| Instalación | Requiere editar `lib/tabs.js` y recompilar | Un solo comando `dsh plugin add link:.` |
| Sandbox | Necesita `sandbox: false` | Pure cliente, sin cambios de sandbox |
| Selector CSS | `[class*="userRow"]` | `data-chat-flow-kind="user"` (exacto) + respaldo |
| Estrategia de salto | Coincidir prefijo de texto + reintentar "Cargar más antiguo" | scrollIntoView directo con referencia de elemento |
| HMR | No aplica (reiniciar proceso) | `ctx.effect` + dispose automático |
| Plataforma | Solo escritorio macOS | Cualquier instancia DSH web (Web / Windows / Linux / WSL / remoto) |

### Limitaciones conocidas

- **Solo contenido visible** — Solo salta a elementos renderizados; las preguntas más allá del límite de paginación ("Cargar más antiguo") aún no pueden saltarse.
- **Sesiones muy largas** — La densidad de indicadores aumenta con más de 500 preguntas; panel de búsqueda futuro ayudará.
- **Solo preguntas del usuario** — Actualmente apunta solo a user flowItems; las respuestas del asistente no son destinos de salto.

### Vista rápida

![Demostración de navegación de preguntas](public/demo.gif)
