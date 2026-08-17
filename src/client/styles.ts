/**
 * Rail stylesheet injection. Injected once per page; the same CSS the
 * desktop shell's preload-nav.js ships, kept byte-identical in behavior.
 */

const STYLE_ID = 'dsh-question-nav-style'

export const PANEL_ID = 'dsh-question-nav'
export const TIP_ID = 'dsh-nav-tooltip'

const STYLES = `
:root { color-scheme: light dark; }
#${PANEL_ID} { position:fixed; right:0; top:70px; bottom:0; width:26px; z-index:2147483000; padding:10px 0;
  background:transparent; cursor:default; -webkit-user-select:none; user-select:none; }
#${PANEL_ID} .rail { position:absolute; left:6px; top:8px; bottom:8px; width:1px; background:rgba(120,128,140,.28); }
#${PANEL_ID} .bar { position:absolute; left:3px; width:14px; height:4px; border-radius:2px; cursor:pointer;
  background:rgba(140,148,160,.35); transition:background .12s; }
#${PANEL_ID} .bar:hover { background:rgba(140,148,160,.6); }
#${PANEL_ID} .bar.current { background:#2f343d; }
@media (prefers-color-scheme: dark) { #${PANEL_ID} .bar.current { background:#e7e9ee; } }
#${TIP_ID} { position:fixed; z-index:2147483001; background:rgba(28,30,36,.95); color:#f2f3f5;
  font:12px/1.5 -apple-system,"PingFang SC",sans-serif; padding:5px 9px; border-radius:6px; pointer-events:none;
  display:none; max-width:280px; box-shadow:0 3px 12px rgba(0,0,0,.35); white-space:pre-wrap; visibility:hidden; }
`

/** Inject the rail stylesheet once. Idempotent. */
export function adoptStyles(): void {
  if (document.getElementById(STYLE_ID) !== null) return
  const st = document.createElement('style')
  st.id = STYLE_ID
  st.textContent = STYLES
  ;(document.head || document.body || document.documentElement).appendChild(st)
}

/** Remove the injected stylesheet (plugin unload). */
export function removeStyles(): void {
  document.getElementById(STYLE_ID)?.remove()
}
