import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const origin = (process.argv[2] ?? 'http://127.0.0.1:5173').replace(/\/$/, '')
const before = process.argv[3]
const output = resolve(process.env.ARCHIVE_EVIDENCE ?? '/tmp/pitch-archive-evidence')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ args: ['--disable-webgl'] })
const results = []
const errors = []
let activePage
const sizes = process.env.ARCHIVE_JOURNEY_ONLY ? [] : [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }, { name: 'landscape', width: 568, height: 320 }]
async function overflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(2)
}
try {
  for (const size of sizes) {
    const context = await browser.newContext({ viewport: size, reducedMotion: 'reduce' })
    const page = await context.newPage()
    activePage = page
    page.on('pageerror', error => errors.push(`${size.name}: ${error.message}`))
    if (before) {
      await page.goto(`${before}/`, { waitUntil: 'networkidle' })
      await page.screenshot({ path: `${output}/before-home-${size.name}.png` })
    }
    await page.goto(`${origin}/`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The pitch, in your hand.')
    const action = page.locator('#case').getByRole('link', { name: 'Open the Pitch Index', exact: true })
    const rect = await action.boundingBox()
    expect(rect.y + rect.height).toBeLessThanOrEqual(size.height)
    await overflow(page)
    await page.screenshot({ path: `${output}/after-home-${size.name}.png` })
    await page.goto(`${origin}/compare/?a=four-seam&b=slider&view=cues`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('region', { name: 'Sourced cue comparison' })).toBeVisible()
    await overflow(page)
    await page.screenshot({ path: `${output}/compare-cues-${size.name}.png` })
    await page.getByRole('button', { name: 'Movement', exact: true }).click()
    await expect(page.getByText('A shared-release illustration.', { exact: false })).toBeVisible()
    await overflow(page)
    await page.screenshot({ path: `${output}/compare-movement-${size.name}.png` })
    await page.goto(`${origin}/pitch/four-seam#grip-lab`, { waitUntil: 'networkidle' })
    await page.locator('#grip-lab').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${output}/study-${size.name}.png` })
    await page.getByRole('button', { name: '02 Fingers', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Read the finger placement.' })).toBeVisible()
    await page.getByRole('button', { name: 'Inspect reference model', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
    await expect(page.getByRole('dialog')).toContainText('125%')
    await page.getByRole('button', { name: 'Reset zoom', exact: true }).click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await overflow(page)
    results.push(`${size.name}: hero CTA, composition, compare views, study, zoom/reset, Escape, no WebGL, reduced motion, overflow passed`)
    await context.close()
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, recordVideo: { dir: output, size: { width: 1280, height: 900 } } })
  const page = await context.newPage()
    activePage = page
  page.on('pageerror', error => errors.push(`journey: ${error.message}`))
  await page.goto(`${origin}/repertoire?q=fastball&view=rows`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Compare four seam', exact: true }).click()
  const row = page.locator('.archive-index-entry').filter({ has: page.getByRole('button', { name: 'Selected four seam', exact: true }) })
  const savedScroll = await page.evaluate(() => window.scrollY)
  await row.getByRole('link').first().click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Four-seam fastball')
  await page.locator('#grip-lab').scrollIntoViewIfNeeded()
  for (const label of ['02 Fingers', '03 Seam', '04 Sourced cue']) {
    await page.getByRole('button', { name: label, exact: true }).click()
    await page.waitForTimeout(450)
  }
  await page.getByRole('button', { name: 'Inspect reference model', exact: true }).click()
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Close inspection', exact: true }).click()
  await page.goBack({ waitUntil: 'networkidle' })
  expect(page.url()).toContain('q=fastball')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.max(0, savedScroll - 4))
  await page.getByRole('link', { name: 'Choose second pitch', exact: true }).click()
  await page.getByLabel('Second pitch', { exact: true }).selectOption('slider')
  await page.getByRole('button', { name: 'Cues', exact: true }).click()
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Grips', exact: true }).click()
  await page.getByRole('button', { name: 'LHP', exact: true }).click()
  await page.getByRole('button', { name: 'Side', exact: true }).click()
  await page.getByRole('link', { name: /^Study Four-seam/ }).click()
  await page.goBack({ waitUntil: 'networkidle' })
  expect(page.url()).toContain('hand=left')
  expect(page.url()).toContain('orientation=side')
  await expect(page.getByLabel('Second pitch', { exact: true })).toHaveValue('slider')
  const videoPath = await page.video().path()
  await context.close()
  results.push(`Recorded index → selection → study → inspection → Back → comparison → specimen → Back: ${videoPath}`)
  if (process.env.ARCHIVE_BUILT === '1') {
    const offline = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const offlinePage = await offline.newPage()
    activePage = offlinePage
    offlinePage.on('requestfailed', request => console.error('OFFLINE_RESOURCE', request.url()))
    offlinePage.on('pageerror', error => console.error('OFFLINE_SCRIPT', error.message))
    await offlinePage.goto(`${origin}/pitch/four-seam/`, { waitUntil: 'networkidle' })
    await offlinePage.evaluate(() => navigator.serviceWorker.ready)
    await offlinePage.reload({ waitUntil: 'networkidle' })
    await offline.setOffline(true)
    await offlinePage.reload({ waitUntil: 'domcontentloaded' })
    await expect(offlinePage.getByRole('heading', { level: 1 })).toHaveText('Four-seam fastball')
    await offlinePage.getByRole('button', { name: '02 Fingers', exact: true }).click()
    await expect(offlinePage.getByRole('heading', { name: 'Read the finger placement.' })).toBeVisible()
    results.push('Built PWA: previously loaded specimen reloads and studies offline')
    await offline.close()
    const staticContext = await browser.newContext({ javaScriptEnabled: false })
    const staticPage = await staticContext.newPage()
    activePage = staticPage
    await staticPage.goto(`${origin}/pitch/four-seam/`)
    await expect(staticPage.getByRole('heading', { level: 1 })).toHaveText('Four-seam fastball')
    await expect(staticPage.getByText('The complete grip notes')).toBeVisible()
    results.push('Prerendered specimen and full notes available without JavaScript')
    await staticContext.close()
  }
  expect(errors).toEqual([])
  await writeFile(`${output}/results.json`, JSON.stringify({ origin, before, timestamp: new Date().toISOString(), webgl: 'disabled', results, errors }, null, 2))
  console.log(JSON.stringify({ output, results }, null, 2))
} catch (error) {
  if (activePage && !activePage.isClosed()) { await activePage.screenshot({ path: `${output}/failure.png` }); console.error(await activePage.url()) }
  throw error
} finally { await browser.close() }
