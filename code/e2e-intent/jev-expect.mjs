// Playwright helper: check the page's visible text against plain-language acceptance criteria.
// One Jev call per screen; every criterion is a noul asked in parallel.
import { noul, TypeSafeClient } from '@typesafe-ai/sdk'
import { expect } from '@playwright/test'

const client = new TypeSafeClient()

// noul >= pass → pass; noul <= fail → fail; anything in between → needs a human look.
export async function expectIntent(page, criteria, { pass = 0.8, fail = 0.2 } = {}) {
  const questions = Object.fromEntries(Object.entries(criteria).map(([k, q]) => [k, noul(q)]))
  const { answers } = await client.systemOne({ state: { page: await page.innerText('body') }, questions })
  for (const [k, { noul: p }] of Object.entries(answers)) {
    const label = `[jev] ${k}: ${criteria[k]} (p=${p.toFixed(2)})`
    if (p > fail && p < pass) console.warn(`UNSURE ${label}`)
    else expect.soft(p, label).toBeGreaterThanOrEqual(pass)
  }
  return answers
}
