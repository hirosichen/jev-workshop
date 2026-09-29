// Demo 5: estimate Jev cost before writing integration code (no API key needed).
// Formula from flaviocopes.com/jev-pricing (overestimates ~20%, fine for budgeting).
const PRICE_PER_MILLION = 0.042

function estimateCost({ items, charsPerItem, questions }) {
  const tokensPerCall = 300 + charsPerItem / 4 + questions * 50
  const totalTokens = items * tokensPerCall
  return { tokensPerCall, totalTokens, cost: `$${((totalTokens / 1e6) * PRICE_PER_MILLION).toFixed(2)}` }
}

const [items, charsPerItem, questions] = process.argv.slice(2).map(Number)
if (items) {
  console.log(estimateCost({ items, charsPerItem, questions }))
} else {
  console.log('support tickets', estimateCost({ items: 100_000, charsPerItem: 800, questions: 5 }))
  console.log('product reviews', estimateCost({ items: 1_000_000, charsPerItem: 400, questions: 3 }))
  console.log('contracts      ', estimateCost({ items: 5_000, charsPerItem: 40_000, questions: 10 }))
  console.log('\nyour workload:  node 05-cost.mjs <items> <charsPerItem> <questions>')
}
