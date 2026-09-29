// Demo 2: support triage — ask every question in ONE call (speculative fan-out).
import { choice, noul, score, TypeSafeClient } from '@typesafe-ai/sdk'

const client = new TypeSafeClient()

// All questions + thresholds live here: this is what a reviewer reads.
const TRIAGE = {
  category: choice('What kind of ticket is `ticket`?', {
    bug_report: 'Something is broken or behaving wrong',
    billing: 'Charges, invoices, refunds, subscriptions',
    feature_request: 'Asks for something that does not exist yet',
    other: null,
  }),
  bug_severity: score('If `ticket` reports a bug, how severe is it?', [
    'Cosmetic; no impact on functionality',
    'Broken or degraded feature, but a workaround exists',
    'Blocking issue; no workaround exists',
  ]),
  has_repro_steps: noul('Does `ticket` include steps to reproduce a problem?'),
  refund_requested: noul('Does `ticket` ask for money back?'),
  frustration: score('How frustrated is the author of `ticket`?', [
    'Calm, just stating facts',
    'Frustrated but civil',
    'Very angry, strong language, or threatening to leave',
  ]),
}

function route(a) {
  if (a.category.confidence < 0.6) return { route: 'human', reason: 'unclear category' }
  switch (a.category.choice) {
    case 'bug_report':
      return a.bug_severity.score > 1.5 && a.has_repro_steps.noul > 0.6
        ? { route: 'engineering', priority: 'high' }
        : { route: 'bug_backlog' }
    case 'billing':
      return { route: 'billing', refundLikely: a.refund_requested.noul > 0.7 }
    case 'feature_request':
      return { route: 'product' }
    default:
      return { route: 'human', flag: a.frustration.score > 1.5 }
  }
}

const tickets = [
  'The export button crashes the settings page in Safari. Steps: open Settings > Export > click. Works in Chrome, but some customers only use Safari.',
  '我這個月被重複扣款兩次，訂單 A-104，請退還多扣的那筆。',
  'It would be great if the dashboard supported dark mode.',
  'This is the third time I am writing. Nothing works and nobody answers. I am cancelling.',
]

for (const ticket of tickets) {
  const { answers, model, usage } = await client.systemOne({ state: { ticket }, questions: TRIAGE })
  console.log('\n' + ticket.slice(0, 70))
  console.log('  category:', answers.category.choice, `(conf ${answers.category.confidence.toFixed(2)})`,
    '| severity:', answers.bug_severity.score.toFixed(2),
    '| refund:', answers.refund_requested.noul.toFixed(2),
    '| frustration:', answers.frustration.score.toFixed(2))
  console.log('  →', route(answers), `[${model}, ${usage.input_tokens} tok]`)
}
