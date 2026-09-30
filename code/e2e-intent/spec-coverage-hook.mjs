// Claude Code Stop hook: block "done" while an OpenSpec scenario has no matching E2E test.
// Scenarios come from openspec/changes/*/specs/**/spec.md; tests are the test() titles under e2e/.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { noul, TypeSafeClient } from '@typesafe-ai/sdk'

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
if (input.stop_hook_active) process.exit(0) // already blocked once this turn; don't loop
if (!process.env.TYPESAFE_API_KEY) process.exit(0)

const root = input.cwd || process.cwd()
const files = (dir, re) =>
  existsSync(dir) ? readdirSync(dir, { recursive: true }).filter((f) => re.test(f)).map((f) => join(dir, f)) : []

const changes = join(root, 'openspec/changes')
const scenarios = files(changes, /specs\/.+\/spec\.md$/)
  .filter((f) => !f.includes('/archive/'))
  .flatMap((f) => readFileSync(f, 'utf8').split(/^#### Scenario:/m).slice(1))
  .map((s) => s.split(/^#{1,4} /m)[0].trim())
if (!scenarios.length) process.exit(0)

const tests = files(join(root, 'e2e'), /\.(spec|test)\.[cm]?[jt]s$/).flatMap((f) =>
  [...readFileSync(f, 'utf8').matchAll(/\btest\(\s*(['"`])(.+?)\1/g)].map((m) => m[2]),
)

const questions = Object.fromEntries(
  scenarios.map((_, i) => [`s${i}`, noul(`Does at least one title in \`tests\` test the scenario in \`scenarios[${i}]\`?`)]),
)
const { answers } = await new TypeSafeClient().systemOne({ state: { scenarios, tests }, questions })

const missing = scenarios.filter((_, i) => answers[`s${i}`].noul < 0.5)
if (!missing.length) process.exit(0)
console.error(`以下 OpenSpec 情境還沒有 E2E 測試，請先補上再結束：\n\n${missing.map((s) => '- ' + s.split('\n')[0]).join('\n')}`)
process.exit(2)
