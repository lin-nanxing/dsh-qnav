/**
 * dsh-question-nav browser half.
 *
 * Injects a slim question-navigation rail into the conversation page: every
 * real user question becomes a tick on the right edge — hover shows the
 * question text, click jumps to that turn, and the current position stays
 * highlighted while scrolling. Pure DOM: observes the conversation flow and
 * needs no official client services (inject: []).
 *
 * @module dsh-question-nav/client
 */

import type { Context } from '@deepseek-ai/cordis'
import { installQuestionNav } from './nav.ts'

export const inject: string[] = []

/**
 * @param _ctx - cordis client context (unused: the feature is pure DOM).
 * @returns a disposer the cordis fiber calls on unload / HMR.
 */
export function apply(_ctx: Context): () => void {
  return installQuestionNav()
}
