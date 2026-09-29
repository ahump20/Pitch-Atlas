import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'

const origin = process.argv[2] || 'http://127.0.0.1:4173'
assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname), 'Use a local built preview')
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ serviceWorkers: 'allow' })
const page = await context.newPage()
let offline = false
const urls = [
  'https://security-test.supabase.co/rest/v1/discussion_media?select=*',
  'https://security-test.supabase.co/auth/v1/user',
  'https://security-test.supabase.co/storage/v1/object/sign/discussion-media/private.png?token=old',
]
await context.route(/^https:\/\/security-test\.supabase\.co\//, async (route) => {
  if (offline) return route.abort('internetdisconnected')
  await route.fulfill({ status: 200, headers: {
    'access-control-allow-origin': '*', 'content-type': 'application/json',
    'access-control-allow-headers': 'authorization',
  }, body: JSON.stringify({ privateAccount: 'account-A' }) })
})
try {
  // This same-origin document has no application script/automatic registration.
  await page.goto(origin + '/sw-private-cache-cleanup.js')
  await page.evaluate(async (urls) => {
    const old = await caches.open('pa-supabase-reads')
    for (const url of urls) await old.put(url, new Response('privateAccount-A'))
  }, urls)
  await page.goto(origin + '/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
  })
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 20000 })
  assert.equal(await page.evaluate(async () => (await caches.keys()).includes('pa-supabase-reads')), false,
    'Activation must purge the previous private response cache')
  await page.reload({ waitUntil: 'domcontentloaded' })
  for (const url of urls) {
    assert.equal(await page.evaluate(async (url) => {
      const result = await fetch(url, { headers: { Authorization: 'Bearer account-A' } })
      return (await result.json()).privateAccount
    }, url), 'account-A')
    assert.equal(await page.evaluate(async (url) => Boolean(await caches.match(url)), url), false,
      'Online private responses must not enter CacheStorage')
  }
  offline = true
  await context.setOffline(true)
  for (const url of urls) {
    assert.equal(await page.evaluate(async (url) => {
      try {
        await fetch(url, { headers: { Authorization: 'Bearer account-B' } })
        return 'response-replayed'
      } catch { return 'network-required' }
    }, url), 'network-required', 'A different viewer must never receive a prior private response')
  }
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('h1').waitFor({ timeout: 15000 })
  console.log('Built service worker PASS: legacy cache purged; REST/auth/signed media network-only; static home reloads offline')
} finally {
  await context.close()
  await browser.close()
}
