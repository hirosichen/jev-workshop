// Demo 3: intent routing (only pay for an LLM when needed) + composite priority score.
import { choice, score, TypeSafeClient } from '@typesafe-ai/sdk'

const client = new TypeSafeClient()

const ROUTER = {
  intent: choice('What does the author of `message` want?', {
    order_status: 'Where is my order, has it shipped, tracking',
    product_question: 'How a product works, compatibility, specs',
    return_exchange: 'Return, exchange, or replace an item',
    complaint: 'Unhappy with service or product, wants a resolution',
    other: null,
  }),
  needs_reasoning: score('How much thought does a good answer to `message` need?', [
    'A lookup or a one-line fact',
    'A short explanation using product knowledge',
    'A judgment call with trade-offs or an unhappy customer',
  ]),
  // Composite scoring: one dimension per Score, weights live in code.
  frustration: score('How frustrated is the author of `message`?', [
    'Calm, just stating facts',
    'Frustrated but civil',
    'Very angry or threatening to leave',
  ]),
}

const WEIGHTS = { needs_reasoning: 0.6, frustration: 0.4 }
const norm = (a, id) => a[id].score / (ROUTER[id].criteria.length - 1)

function handler(a) {
  if (a.intent.confidence < 0.5) return 'human (low confidence)'
  switch (a.intent.choice) {
    case 'order_status': return 'lookupOrder() — no LLM'
    case 'product_question': return 'LLM + PRODUCT_CONTEXT'
    case 'return_exchange': return 'LLM + RETURNS_CONTEXT'
    case 'complaint': return a.needs_reasoning.score > 1 ? 'human' : 'LLM + COMPLAINT_CONTEXT'
    default: return 'human'
  }
}

const messages = [
  'Where is my order #8812? It said shipped on Monday.',
  'Does the X200 charger work with a 2019 MacBook Pro?',
  '鞋子尺寸太小，我想換大一號。',
  'Your courier threw my package over the fence and it broke. I want this fixed today or I am done with you.',
]

for (const message of messages) {
  const { answers } = await client.systemOne({ state: { message }, questions: ROUTER })
  const priority = Object.entries(WEIGHTS).reduce((s, [id, w]) => s + w * norm(answers, id), 0)
  console.log(`\n${message.slice(0, 70)}\n  ${answers.intent.choice} (conf ${answers.intent.confidence.toFixed(2)}) → ${handler(answers)} | priority ${priority.toFixed(2)}`)
}
