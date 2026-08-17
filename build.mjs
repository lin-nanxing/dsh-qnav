/**
 * Single-file client + ESM host build for dsh-question-nav.
 *
 * The web server serves exactly one file per plugin
 * (/plugins/dsh-question-nav/client.js), so the client half is one CJS
 * bundle wrapped in the ModuleLoader factory handshake; this plugin imports
 * no @deepseek-ai/dsh-* or react at runtime (pure DOM), so nothing extra
 * stays external besides cordis (type-only). The host half is plain ESM for
 * Node, externalizing @deepseek-ai/cordis.
 */
import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

mkdirSync('lib', { recursive: true })

const dshExternal = ['@deepseek-ai/cordis', '@deepseek-ai/dsh-*']

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  sourcemap: true,
  external: dshExternal,
  logLevel: 'info',
})

await build({
  entryPoints: ['src/client/index.ts'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  sourcemap: true,
  external: dshExternal,
  banner: {
    js: "window.__ModuleLoader__.load({ id: 'dsh-question-nav', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
})

execFileSync('node_modules/.bin/tsc', ['-p', 'tsconfig.json'], { stdio: 'inherit' })
