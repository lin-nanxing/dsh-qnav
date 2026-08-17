/**
 * dsh-question-nav host half: a no-op.
 *
 * The question-navigation rail is a purely browser-side feature — the client
 * half (src/client) injects the right-edge rail into the conversation page.
 * This host half only satisfies the cordis plugin contract so the bundle can
 * be mounted via cordis.patch.yml; it needs no Node-side logic.
 *
 * @module dsh-question-nav
 */

import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-question-nav'
export const inject: string[] = []

/**
 * @param _ctx - cordis context (unused: the feature is client-side only).
 */
export function apply(_ctx: Context): void {
  // no-op — see module docs.
}
