# dsh-question-nav

DSH web plugin — right-edge question navigation rail for long conversations.
Each real user question gets a hoverable tick on the right edge; click to jump straight to that turn, current position stays highlighted while scrolling.

---

## 🇨🇳 中文 (Chinese)

### 一句话定位

为 DSH 长会话注入右侧「提问导航」窄竖条——每条真实用户提问一根悬浮可点击刻度，点击直接跳到该轮提问位置，滚动时当前提问高亮。

### 安装（三步即可运行）

```bash
# 1. 从 GitHub clone
git clone https://github.com/lin-nanxing/dsh-qnav.git
cd dsh-question-nav

# 2. 构建（如果修改过源码后需要重新 build）
npm run build

# 3. 一行命令挂载到 DSH
dsh plugin --profile web add link:.
```

> 💡 **不需要发 npm！**
> 上面的 `link:` 就是告诉 DSH 从本地路径安装。你从仓库 clone 下来之后，**直接在项目目录执行第 3 步就行**。
>
> 「发布 npm」的意思是：把你这个包上传到 npm 注册中心（类似一个公共仓库），这样别人只需敲 `dsh plugin --profile web add dsh-qnav` 就能安装，不用自己 clone。**这一步是可选的**，不影响你自己使用。

### 核心功能

1. **精准提取** —— 利用 DSH 对话 DOM 节点属性 `data-chat-flow-kind="user"` 直接读取真实用户提问容器，排除 steering / pending / context 等非用户输入行；带 `[class*="userRow"]` 兜底兼容。
2. **元素引用跳转** —— 不再做文本前缀匹配，而是保存每根 `flowItem` 元素引用，点击后直接 `scrollIntoView` 定位目标。彻底解决相同提问被去重、共享前缀跳错位置、@引用拆分导致匹配失败等 bug。
3. **自动过滤无效行** —— 通过 `data-pending-steering` 和 `data-chat-flow-kind` 剔除未提交的输入行和系统注入上下文，不会生成误导性空占位 tick。
4. **比例布局横条** —— 每根 tick 按索引均匀分布在右侧边缘，间距随提问数量自适应计算。
5. **深色模式支持** —— CSS `color-scheme: light dark` + `@media (prefers-color-scheme: dark)` 自动跟随页面主题切换高亮色。
6. **悬浮提示气泡** —— Hover tick 时在左侧显示「N. <提问全文>」；气泡向左展开避免溢出视口右缘，且先隐藏量完尺寸再定位（防闪烁）。
7. **当前提问高亮** —— 基于元素位置实时更新（`getBoundingClientRect().top ≤ 120px`），比原文本 TreeWalker 更可靠，不受回答正文引用干扰。
8. **MutationObserver 实时同步** —— 会话 DOM 变化后 500ms 防抖重新扫描并渲染横条；当前高亮每 600ms 轮询更新。
9. **HMR / 卸载安全** —— `apply(ctx)` 返回 disposer，清理 MutationObserver + setInterval + 注入 DOM + 样式表，热替换或插件禁用时无残留。

### 与桌面版 preload 的改进

| 维度 | 桌面版 `preload-nav.js` | `dsh-question-nav` 插件 |
|---|---|---|
| 运行环境 | Electron shell preload（仅桌面壳可用） | DSH web client 半（任意平台通用） |
| 安装方式 | 必须修改 `lib/tabs.js` 重新编译 | `dsh plugin add link:.` 一行命令挂载 |
| 沙箱要求 | 需关闭 sandbox (`sandbox: false`) | 纯 client，无需修改渲染沙箱 |
| CSS 选择器 | `[class*="userRow"]` | `data-chat-flow-kind="user"`（精确）+ 兜底 |
| 跳转策略 | 文本前缀匹配 + "加载更早"重试 12 次 | 元素引用直接 scrollIntoView |
| HMR 安全 | 不适用（Electron 进程重启） | `ctx.effect` + disposer 自动清理 |
| 多平台 | 仅 macOS 桌面壳 | 任意 DSH web 实例（Web / Windows / Linux / WSL / 远程） |

### 已知局限

- **仅可见内容** —— 只展示已滚入视口的提问（「加载更早」之前的尚未渲染到 DOM）；无法跳转到尚未加载的历史问题。
- **超长会话性能** —— 500+ 提问时横条间距密集；后续可增加搜索面板。
- **仅限用户提问** —— 目前只定位 user flowItem，不支持跳转到助手回答。

### 快速预览

![提问导航演示](public/demo.gif)

---

## 🇺🇸 English

### One-liner

A slim right-edge question-navigation rail for long DSH conversations — every real user question gets a hoverable tick; click to jump straight to that turn, current position auto-highlights while scrolling.

### Install (three steps)

```bash
# 1. Clone from GitHub
git clone https://github.com/lin-nanxing/dsh-qnav.git
cd dsh-question-nav

# 2. Build (only if you modify source code)
npm run build

# 3. One-line command to mount into DSH
dsh plugin --profile web add link:.
```

> 💡 **No npm publish needed!**
> The `link:` prefix tells DSH to install from a local path. After cloning, **just run step 3 in the project directory**.
>
> "Publishing to npm" means uploading your package to the public npm registry so others can simply type `dsh plugin --profile web add dsh-qnav`. **This is optional** — it doesn't affect your own usage.

### Key Features

1. **Precise extraction** — Reads real user questions from DSH conversation DOM nodes using `data-chat-flow-kind="user"`, filtering out steering/pending/context rows; falls back to `[class*="userRow"]`.
2. **Element-reference jumping** — Saves each `flowItem` DOM element reference instead of text-prefix matching; clicks call `scrollIntoView()` directly. Eliminates dedup bugs, prefix collisions, and @-reference text-node splits.
3. **Auto-filter non-user rows** — Excludes uncommitted inputs and system-injected contexts via `data-pending-steering` and `data-chat-flow-kind`. No misleading empty ticks.
4. **Proportional layout** — Ticks are evenly spaced along the right edge, adapting count as questions accumulate.
5. **Dark-mode support** — CSS `color-scheme: light dark` + `@media (prefers-color-scheme: dark)` switches highlight color automatically with page theme.
6. **Hover tooltip bubble** — Hovering shows "N. <full question>" to the left; bubbles anchor left to avoid viewport overflow and measure dimensions before positioning (no flicker).
7. **Current-position highlight** — Updates via element rects (`getBoundingClientRect().top ≤ 120px`) instead of fragile text-tree walks, immune to answer-body quoting interference.
8. **MutationObserver sync** — Re-scans & re-renders ticks on content change (500ms debounce); highlight polls every 600ms.
9. **HMR-safe** — `apply(ctx)` returns a disposer that tears down observers, intervals, injected DOM, and stylesheets — no leaks on hot-reload or disable.

### Improvements over desktop preload

| Dimension | Desktop `preload-nav.js` | `dsh-question-nav` plugin |
|---|---|---|
| Runtime | Electron shell preload (desktop only) | DSH web client (any platform) |
| Install | Requires editing `lib/tabs.js` & rebuild | One-line `dsh plugin add link:.` |
| Sandbox | Needs `sandbox: false` | Pure client, no sandbox changes |
| CSS selector | `[class*="userRow"]` | `data-chat-flow-kind="user"` (exact) + fallback |
| Jump strategy | Text-prefix match + "Load older" retry | Direct element scrollIntoView |
| HMR | N/A (restart process) | `ctx.effect` + auto-dispose |
| Platform | macOS desktop only | Any DSH web (Web / Win / Linux / WSL / remote) |

### Known limitations

- **Visible-only** — Only scrolls to rendered items; questions beyond the pagination boundary ("Load older" cutoff) cannot be jumped to yet.
- **Very long sessions** — Tick density increases with 500+ questions; future search panel will help.
- **User questions only** — Currently targets user flowItems; assistant answers are not jump targets.

### Quick preview

![Question navigation demo](public/demo.gif)

---

## 🇯🇵 日本語 (Japanese)

### 一言で言うと

DSH の長い会話に右端の質問ナビゲーションレールを注入します。各ユーザーの質問にホバー可能な目印が表示され、クリックするとその箇所へジャンプし、スクロール中は現在地がハイライトされます。

### インストール（3 ステップで動作）

```bash
# 1. GitHub から clone
git clone https://github.com/lin-nanxing/dsh-qnav.git
cd dsh-question-nav

# 2. ビルド（ソースコードを変更した場合のみ必要）
npm run build

# 3. DSH にマウントする一行コマンド
dsh plugin --profile web add link:.
```

> 💡 **npm 公開は不要です！**
> `link:` は DSH にローカルパスからインストールするよう指示します。clone 後、**プロジェクトディレクトリでステップ 3 を実行するだけです**。
>
> 「npm に公開する」というのは、あなたのパッケージをパブリックな npm レジストリにアップロードすることです。これにより他の人は `dsh plugin --profile web add dsh-qnav` と打ち込むだけでインストールできます。**これはオプション**であり、ご自身の使用には影響しません。

### 主な機能

1. **正確な抽出** — DSH 対話 DOM ノードの `data-chat-flow-kind="user"` を使用して実際のユーザー質問を取得し、steering / pending / context などの非入力行を除外します。[class\*="userRow"] でフォールバック。
2. **要素参照によるジャンプ** — テキストプレフィックスマッチングの代わりに各 `flowItem` DOM 要素の参照を保持し、クリック時に直接 `scrollIntoView()` を実行。同じ質問の重複除外や、共通プレフィックスでの誤ジャンプ、@参照によるテキストノード分割の問題を解消します。
3. **無効行の自動フィルタリング** — `data-pending-steering` と `data-chat-flow-kind` 属性で未送信の入力やシステム注入文脈を除外し、誤解を招く空のティックは生成しません。
4. **比率レイアウト** — 各ティックは右端に均等に配置され、質問数に応じて間隔が適応計算されます。
5. **ダークモード対応** — CSS `color-scheme: light dark` + `@media (prefers-color-scheme: dark)` がページテーマに合わせてハイライトカラーを自動切り替えします。
6. **ホバーツールチップ** — ティックにマウスを乗せると左側に「N. <質問本文>」を表示。画面右端からはみ出さないよう左に配置し、サイズ測定後に位置決定（フリッカー防止）。
7. **現在地のハイライト** — 要素位置に基づくリアルタイム更新（`getBoundingClientRect().top ≤ 120px`）、アシスタント回答の本文引用に影響されません。
8. **MutationObserver 同期** — コンテンツ変更時に 500ms ディバウンスで再スキャン・再レンダリング。現在地のハイライトは 600ms ごとにポーリング更新。
9. **HMR / アンインストール安全** — `apply(ctx)` はディスポザーを返すため、監視子、インターバル、注入された DOM やスタイルシートのクリーンアップが自動で行われ、ホットリロードや無効化後も残骸が残らないようにします。

### デスクトップ版 preload との違い

| 観点 | デスクトップ版 `preload-nav.js` | `dsh-question-nav` プラグイン |
|---|---|---|
| 実行環境 | Electron shell プリロード（デスクトップのみ） | DSH web クライアント（全プラットフォーム） |
| インストール方法 | `lib/tabs.js` を編集して再コンパイル必要 | `dsh plugin add link:.` 一行コマンド |
| サンドボックス | `sandbox: false` が必要 | 純粋なクライアント、サンドボックス変更不要 |
| CSS セレクタ | `[class*="userRow"]` | `data-chat-flow-kind="user"`（正確）＋ フォールバック |
| ジャンプ手法 | テキストプレフィックスマッチ＋「もっと見る」再試行 | 要素参照による直接 scrollIntoView |
| HMR 対応 | 適用外（Electron プロセス再起動） | `ctx.effect` ＋ 自動ディスポーズ |
| プラットフォーム | macOS デスクトップのみ | 任意の DSH web インスタンス（Web / Windows / Linux / WSL / リモート） |

### 既知の制限

- **表示内容のみ** — ビューポート内に読み込まれた質問のみ対象です。「もっと読む」より前の履歴はまだ DOM に描画されていないため、ジャンプできません。
- **超長セッション** — 500 件以上の質問ではティックの密度が高くなります。将来的に検索パネルを追加予定。
- **ユーザー質問のみ** — user flowItem のみを対象とし、アシスタント回答へのジャンプには対応していません。

### プレビュー

![質問ナビゲーションのデモ](public/demo.gif)

---

## 🇪🇸 Español (Spanish)

### En una línea

Una barra lateral de navegación por preguntas en el borde derecho para conversaciones largas en DSH: cada pregunta real del usuario obtiene un indicador sobre el que pasar el cursor; haz clic para saltar directamente a esa ronda y la posición actual se resalta automáticamente mientras haces scroll.

### Instalación (tres pasos)

```bash
# 1. Clonar desde GitHub
git clone https://github.com/lin-nanxing/dsh-qnav.git
cd dsh-question-nav

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

---

## 🇫🇷 Français (French)

### En une phrase

Un rail de navigation par question sur le bord droit pour les longues conversations DSH — chaque vraie question utilisateur reçoit une pastille survolable ; cliquez pour sauter directement au tour concerné, la position actuelle reste mise en évidence pendant le défilement.

### Installation (trois étapes)

```bash
# 1. Cloner depuis GitHub
git clone https://github.com/lin-nanxing/dsh-qnav.git
cd dsh-question-nav

# 2. Construire (uniquement si vous modifiez le code source)
npm run build

# 3. Une seule commande pour monter dans DSH
dsh plugin --profile web add link:.
```

> 💡 **Pas besoin de publier sur npm !**
> Le préfixe `link:` indique à DSH d'installer depuis un chemin local. Après avoir cloné, **exécutez simplement l'étape 3 dans le répertoire du projet**.
>
> « Publier sur npm » signifie uploader votre paquet sur le registre public npm pour que d'autres puissent simplement taper `dsh plugin --profile web add dsh-qnav`. **C'est optionnel** — cela n'affecte pas votre propre utilisation.

### Fonctionnalités clés

1. **Extraction précise** — Lit les vraies questions utilisateur depuis les nœuds DOM de conversation DSH via `data-chat-flow-kind="user"`, filtre les lignes steering/pending/contexte ; inclut un secours avec `[class*="userRow"]`.
2. **Saut par référence d'élément** — Sauvegarde la référence DOM de chaque `flowItem` au lieu de faire une correspondance par préfixe de texte ; les clics appellent directement `scrollIntoView()`. Élimine les bugs de déduplication, collisions de préfixes et divisions de nœuds de texte par références @.
3. **Filtrage automatique des lignes invalides** — Exclut les entrées non validées et les injections système via `data-pending-steering` et `data-chat-flow-kind`. Pas de pastilles trompeuses vides.
4. **Disposition proportionnelle** — Les pastilles sont réparties uniformément le long du bord droit, s'adaptant selon le nombre de questions.
5. **Support du mode sombre** — CSS `color-scheme: light dark` + `@media (prefers-color-scheme: dark)` change automatiquement la couleur de mise en évidence selon le thème de la page.
6. **Infobulle de survol** — Au survol, affiche « N. <question complète> » à gauche ; les infobulles s'ancrent à gauche pour éviter le débordement et mesurent leurs dimensions avant positionnement (sans scintillement).
7. **Mise en évidence de la position courante** — Mise à jour en temps réel via les rectangles d'éléments (`getBoundingClientRect().top ≤ 120px`) au lieu de traversées fragiles de l'arbre de texte, insensible aux citations dans les réponses.
8. **Synchronisation MutationObserver** — Rescan et rerendu des pastilles après modification du contenu (debounce 500ms) ; la mise en évidence est actualisée toutes les 600 ms.
9. **Sécurité HMR** — `apply(ctx)` renvoie un dispositif qui nettoie les observateurs, intervalles, le DOM injecté et les feuilles de style — pas de fuites lors du rechargement ou de la désactivation.

### Améliorations par rapport au preload bureau

| Dimension | Preload bureau `preload-nav.js` | Plugin `dsh-question-nav` |
|---|---|---|
| Environnement | Preload du shell Electron (bureau uniquement) | Client web DSH (toute plateforme) |
| Installation | Nécessite édition de `lib/tabs.js` + recompilation | Une seule commande `dsh plugin add link:.` |
| Sandbox | Besoin de `sandbox: false` | Pur client, sans changement de sandbox |
| Sélecteur CSS | `[class*="userRow"]` | `data-chat-flow-kind="user"` (exact) + secours |
| Stratégie de saut | Correspondance préfixe de texte + réessais « Charger plus ancien » | scrollIntoView direct avec référence d'élément |
| HMR | Non applicable (redémarrage processus) | `ctx.effect` + dispose automatique |
| Plateforme | Bureau macOS uniquement | Toute instance DSH web (Web / Windows / Linux / WSL / distant) |

### Limitations connues

- **Contenu uniquement visible** — Ne saute qu'aux éléments déjà rendus ; les questions au-delà de la limite de pagination (« Charger plus ancien ») ne peuvent pas être atteintes encore.
- **Sessions très longues** — La densité des pastilles augmente avec plus de 500 questions ; un panneau de recherche futur aidera.
- **Questions utilisateur uniquement** — Cible actuellement seulement les user flowItems ; les réponses de l'assistant ne sont pas des cibles de saut.

### Aperçu rapide

![Démo de navigation par question](public/demo.gif)
