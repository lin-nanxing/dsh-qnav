/**
 * dsh-question-nav core: the question-navigation rail.
 *
 * Behavior is ported 1:1 from the desktop shell's preload-nav.js (which is
 * kept intact at desktop/preload-nav.js):
 *
 * - Real user questions are located by `data-chat-flow-kind="user"` flowItem
 *   containers (CSS-module-hash tolerant; falls back to `[class*="userRow"]`
 *   minus pending-steering rows), each question keeps its DOM element
 *   reference — jump / current-highlight use the element directly, never
 *   text matching, so duplicate questions, shared prefixes, whitespace
 *   collapsing and @-reference text-node splits cannot break navigation.
 * - One tick per question, laid out proportionally on the right edge; the
 *   current question (last one whose element top is above the 120px
 *   threshold) is highlighted; hover shows "N. <question text>".
 * - A MutationObserver re-scans on content change; the highlight poll keeps
 *   itself in sync while scrolling.
 *
 * `installQuestionNav()` mounts the rail and returns a disposer the plugin
 * calls on unload / HMR (observers, interval and injected DOM all removed).
 */

import { adoptStyles, removeStyles, PANEL_ID, TIP_ID } from './styles.ts'

interface Question {
  /** Collapsed question text, for the tooltip only. */
  text: string
  /** Live DOM element of the user turn's flowItem. */
  el: Element
}

function body(): HTMLElement {
  return document.body || document.documentElement
}

function makeEl(tag: string, cssText?: string): HTMLElement {
  const e = document.createElement(tag)
  if (cssText) e.style.cssText = cssText
  return e
}

/** Real user question containers: one flowItem per user turn. */
function questionFlowItems(): Element[] {
  let rows = Array.from(document.querySelectorAll('[data-chat-flow-kind="user"]'))
  if (!rows.length) {
    // Fallback: if dsh web renames the attribute, go back to userRow and
    // drop not-yet-committed pending-steering rows.
    rows = Array.from(document.querySelectorAll('[class*="userRow"]')).filter((e) => !e.hasAttribute('data-pending-steering'))
  }
  return rows
}

function extractUserQuestions(): Question[] {
  const out: Question[] = []
  for (const row of questionFlowItems()) {
    const bubble = row.querySelector('[class*="bubble"]')
    const src = (bubble ?? row) as HTMLElement
    // textContent(而非 innerText):jsdom 与真实浏览器都支持,行为对提问气泡一致
    const text = (src.textContent ?? '').trim().replace(/\s+/g, ' ') || '(无文字)'
    out.push({ text, el: row })
  }
  return out
}

function buildPanel(): HTMLElement {
  let panel = document.getElementById(PANEL_ID)
  if (!panel) {
    panel = makeEl('div')
    panel.id = PANEL_ID
    body().appendChild(panel)
  }
  panel.innerHTML = ''
  panel.appendChild(makeEl('div'))
  const rail = makeEl('div')
  rail.className = 'rail'
  panel.appendChild(rail)
  return panel
}

function render(questions: Question[], tip: HTMLElement): void {
  const panel = buildPanel()
  if (!questions.length) {
    panel.appendChild(makeEl('div', 'position:absolute;top:6px;left:3px;width:14px;height:4px;border-radius:2px;background:rgba(140,148,160,.2);'))
    return
  }
  const count = questions.length
  questions.forEach((q, i) => {
    const bar = makeEl('div')
    bar.className = 'bar'
    bar.style.top = (10 + i * (80 / Math.max(1, count - 1))) + '%'
    bar.dataset.idx = String(i)
    bar.addEventListener('mouseenter', () => {
      tip.textContent = (i + 1) + '. ' + q.text
      tip.style.display = 'block'
      tip.style.visibility = 'hidden' // measure first, then position — no flicker
      const r = bar.getBoundingClientRect()
      const tipW = tip.offsetWidth || 280
      const tipH = tip.offsetHeight || 32
      const left = Math.max(4, r.left - tipW - 10) // open to the left, off the viewport edge
      tip.style.left = left + 'px'
      tip.style.top = Math.max(4, Math.min(r.top - 4, window.innerHeight - tipH - 8)) + 'px'
      tip.style.visibility = 'visible'
    })
    bar.addEventListener('mouseleave', () => { tip.style.display = 'none' })
    bar.addEventListener('click', () => jumpTo(questions, i))
    panel.appendChild(bar)
  })
  updateCurrent(questions)
}

function updateCurrent(questions: Question[]): void {
  const bars = document.querySelectorAll('#' + PANEL_ID + ' .bar')
  if (!bars.length) return
  const idx = computeCurrentIndex(questions)
  bars.forEach((b) => b.classList.toggle('current', Number((b as HTMLElement).dataset.idx) === idx))
}

/** Current question = the last one whose element top is at/below the 120px threshold. */
function computeCurrentIndex(questions: Question[]): number {
  let current = 0
  for (let i = 0; i < questions.length; i++) {
    const el = questions[i].el
    if (el.isConnected && el.getBoundingClientRect().top <= 120) current = i
  }
  return current
}

/** Resolve the question element by ordinal: fresh DOM snapshot first (React
 * re-renders may detach cached references), cached element as fallback. */
function resolveQuestionEl(questions: Question[], i: number): Element | null {
  const els = questionFlowItems()
  if (els[i]) return els[i]
  const q = questions[i]
  return q && q.el.isConnected ? q.el : null
}

function jumpTo(questions: Question[], i: number): void {
  const target = resolveQuestionEl(questions, i)
  if (target) target.scrollIntoView({ block: 'start', behavior: 'smooth' })
}

/** Mount the rail once the document is ready; returns a disposer. */
export function installQuestionNav(): () => void {
  if (document.readyState === 'loading') {
    let disposed = false
    let dispose: (() => void) | null = null
    const onReady = () => {
      document.removeEventListener('DOMContentLoaded', onReady)
      if (!disposed) dispose = start()
    }
    document.addEventListener('DOMContentLoaded', onReady)
    return () => {
      disposed = true
      dispose?.()
    }
  }
  return start()
}

function start(): () => void {
  adoptStyles()
  const panel = buildPanel()
  const tip = makeEl('div')
  tip.id = TIP_ID
  body().appendChild(tip)

  let questions: Question[] = []
  let lastKey = ''
  let refreshTimer = 0

  const refresh = () => {
    const qs = extractUserQuestions()
    const key = qs.map((q) => q.text).join('\u0001')
    if (key === lastKey) return
    lastKey = key
    questions = qs
    render(questions, tip)
  }

  refresh()

  const mo = new MutationObserver(() => {
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(refresh, 500)
  })
  mo.observe(body(), { childList: true, subtree: true })

  const hi = setInterval(() => updateCurrent(questions), 600)

  return () => {
    clearTimeout(refreshTimer)
    clearInterval(hi)
    mo.disconnect()
    panel.remove()
    tip.remove()
    removeStyles()
  }
}
