// Demo 4: safety gate before a coding agent runs a shell command.
// Usage: node --env-file=.env 04-shell-guard.mjs "git push -f"   (exit 0 allow, 1 ask, 2 block)
// No args → runs a few sample commands.
import { choice, noul, TypeSafeClient } from '@typesafe-ai/sdk'

const client = new TypeSafeClient()

const GUARD = {
  risk: choice('What is the effect of running `command` in `cwd`?', {
    read_only: 'Only reads or lists; changes nothing',
    reversible: 'Changes files or state, but can easily be undone',
    irreversible: 'Deletes data, rewrites history, or affects remote/production systems',
  }),
  deletes_files: noul('Does `command` delete files or directories?'),
  rewrites_git_history: noul('Does `command` rewrite or discard git history or remote branches?'),
  deploys_to_prod: noul('Does `command` deploy or publish to a production or remote environment?'),
}
const AUTO_ALLOW = 0.9 // only read_only above this runs without asking

async function check(command, cwd = process.cwd()) {
  const { answers: a } = await client.systemOne({ state: { command, cwd }, questions: GUARD })
  const danger = Math.max(a.deletes_files.noul, a.rewrites_git_history.noul, a.deploys_to_prod.noul)
  const verdict =
    a.risk.choice === 'irreversible' || danger > 0.7 ? 'BLOCK'
    : a.risk.choice === 'read_only' && a.risk.confidence > AUTO_ALLOW ? 'ALLOW'
    : 'ASK'
  console.log(`${verdict.padEnd(5)} ${command}  (${a.risk.choice}, conf ${a.risk.confidence.toFixed(2)}, danger ${danger.toFixed(2)})`)
  return verdict
}

const arg = process.argv.slice(2).join(' ')
if (arg) {
  const v = await check(arg)
  process.exit({ ALLOW: 0, ASK: 1, BLOCK: 2 }[v])
}
for (const cmd of ['ls -la src/', 'git stash', 'rm -rf node_modules', 'git push -f origin main', 'vercel deploy --prod']) {
  await check(cmd)
}
