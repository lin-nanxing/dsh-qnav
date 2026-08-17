# dsh-qnav

<div align="center">

[English](README.md) · **中文** · [日本語](README.ja-JP.md) · [Español](README.es.md) · [Français](README.fr.md)

</div>

---

### 一句话定位

为 DSH 长会话注入右侧「提问导航」窄竖条——每条真实用户提问一根悬浮可点击刻度，点击直接跳到该轮提问位置，滚动时当前提问高亮。

### 安装（三步即可运行）

```bash
# 1. 从 GitHub clone
git clone https://github.com/lin-nanxing/dsh-qnav.git
cd dsh-qnav

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
