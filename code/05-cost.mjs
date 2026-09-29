// Demo 5: estimate what a workload costs on Jev (no API key needed).
// Price: $42 per billion input tokens, output tokens free (typesafe.ai, docs.typesafe.ai/models).
// Tokens per call: send one real request and read usage.input_tokens.
// The workshop's hands-on request (one short message, 3 questions) used about 480.
const PRICE_PER_TOKEN = 42 / 1e9
const USD_TO_TWD = 32 // rough exchange rate; adjust to today's

function estimate({ items, tokensPerCall }) {
  const usd = items * tokensPerCall * PRICE_PER_TOKEN
  return { items, tokensPerCall, usd: `$${usd.toFixed(4)}`, twd: `NT$${(usd * USD_TO_TWD).toFixed(2)}` }
}

const [items, tokensPerCall] = process.argv.slice(2).map(Number)
if (items) {
  console.log(estimate({ items, tokensPerCall: tokensPerCall || 480 }))
} else {
  console.log('1,000 customer messages  ', estimate({ items: 1_000, tokensPerCall: 480 }))
  console.log('100,000 customer messages', estimate({ items: 100_000, tokensPerCall: 480 }))
  console.log('\nyour workload:  node 05-cost.mjs <items> <tokensPerCall>')
}
