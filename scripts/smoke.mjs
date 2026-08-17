/**
 * Smoke test: load the built client bundle in a jsdom page that mimics the
 * DSH conversation DOM, then verify the rail mounts, renders one tick per
 * real user question (assistant rows ignored), the tooltip fills on hover,
 * and the disposer removes everything.
 *
 * Run: pnpm smoke  (needs `pnpm build` first)
 */
import { JSDOM } from 'jsdom'

const dom = new JSDOM(
  `<!doctype html><html><head></head><body>
    <div data-chat-flow-kind="user"><div class="x_bubble">第一个问题</div></div>
    <div data-chat-flow-kind="assistant-step"><div>某回答内容</div></div>
    <div data-chat-flow-kind="user"><div class="x_bubble">第二个问题</div></div>
  </body></html>`,
  { pretendToBeVisual: true },
)

globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.MutationObserver = dom.window.MutationObserver

let handoff = null
dom.window.__ModuleLoader__ = { load: (h) => { handoff = h } }

await import('../lib/client.js')

if (!handoff) throw new Error('client bundle did not call __ModuleLoader__.load')
const mod = handoff.factory((id) => { throw new Error(`unexpected require: ${id}`) })

let failed = false
const assert = (cond, msg) => {
  if (!cond) { failed = true; console.error('❌ ' + msg) } else { console.log('✅ ' + msg) }
}

assert(Array.isArray(mod.inject) && mod.inject.length === 0, 'inject 为空数组(纯 DOM 插件)')
assert(typeof mod.apply === 'function', '导出 apply(ctx)')

const dispose = mod.apply({})
const doc = dom.window.document

const panel = doc.getElementById('dsh-question-nav')
assert(panel !== null, 'rail 面板已注入')
const bars = panel.querySelectorAll('.bar')
assert(bars.length === 2, `每条真实提问一根 tick(收到 ${bars.length}, 期望 2;assistant 行应被忽略)`)

// hover 第一根 tick → tooltip 出现且内容为 "1. 第一个问题"
bars[0].dispatchEvent(new dom.window.MouseEvent('mouseenter', { bubbles: true }))
const tip = doc.getElementById('dsh-nav-tooltip')
assert(tip !== null && tip.style.display === 'block', 'hover 显示 tooltip')
assert(tip.textContent === '1. 第一个问题', `tooltip 文本正确(收到 "${tip.textContent}")`)

// dispose → 全部移除
dispose()
assert(doc.getElementById('dsh-question-nav') === null, 'dispose 移除 rail 面板')
assert(doc.getElementById('dsh-nav-tooltip') === null, 'dispose 移除 tooltip')
assert(doc.getElementById('dsh-question-nav-style') === null, 'dispose 移除样式')

console.log(failed ? '\nSMOKE FAIL' : '\nSMOKE PASS')
process.exitCode = failed ? 1 : 0
