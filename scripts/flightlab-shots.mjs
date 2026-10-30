// Throwaway: screenshots of the Flight Lab arsenal in a real browser with WebGL.
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const origin = process.argv[2] ?? 'http://localhost:4173'
const out = process.argv[3] ?? 'shots'
const pitches = (process.argv[4] ?? 'lob,knuckler,backspin,topspin,sidespin').split(',')
await mkdir(out, { recursive: true })
const log = []

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
})

async function open(width, height, pitch) {
  const page = await browser.newPage({ viewport: { width, height } })
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) log.push(`[${pitch} ${width}] ${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => log.push(`[${pitch} ${width}] pageerror: ${e.message}\n${(e.stack ?? '').split('\n').slice(0, 14).join('\n')}`))
  page.setDefaultTimeout(60000)
  await page.goto(`${origin}/softball/flight-lab/${pitch && pitch !== 'lob' ? `?pitch=${pitch}` : ''}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-stage-ready="true"], [data-stage-mode="schematic"]', { timeout: 120000 })
  await page.waitForTimeout(1500)
  log.push(`[${pitch} ${width}] stage mode: ${await page.getAttribute('[data-stage-mode]', 'data-stage-mode')}`)
  return page
}

const stage = (page) => page.locator('[data-flight-stage]')

async function throwAndShoot(page, name) {
  await page.click('[data-flight-throw]')
  for (const [ms, tag] of [[250, 'a'], [300, 'b'], [300, 'c'], [300, 'd'], [2600, 'e']]) {
    await page.waitForTimeout(ms)
    await stage(page).screenshot({ path: `${out}/${name}-${tag}.png` })
  }
}

async function attempt(name, fn) {
  try {
    await fn()
  } catch (e) {
    log.push(`[${name}] FAILED: ${e.message.split('\n')[0]}`)
  }
}

for (const pitch of pitches) await attempt(pitch, async () => {
  const page = await open(1440, 960, pitch)
  for (const view of (process.argv[6] ?? 'Zone,Catcher,Arc,Reach,Ball').split(',')) {
    const cam = page.getByRole('group', { name: 'Camera' }).getByRole('button', { name: view })
    if ((await cam.count()) === 0) {
      log.push(`[${pitch}] no ${view} camera: the scene fell back to the schematic`)
      break
    }
    await cam.click()
    await page.waitForTimeout(1600)
    await throwAndShoot(page, `${pitch}-${view.toLowerCase()}`)
  }
  await page.screenshot({ path: `${out}/${pitch}-page.png` })
  await page.close()
})

if (process.argv[5] !== 'nogame') {
// Phone width, and the call game
await attempt('phone', async () => {
  const page = await open(390, 844, 'knuckler')
  await page.screenshot({ path: `${out}/phone-knuckler.png`, fullPage: false })
  await page.getByRole('button', { name: 'Call the pitch' }).click()
  await page.getByRole('button', { name: 'Deal' }).click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${out}/phone-call-inflight.png` })
  await page.close()
})
await attempt('call', async () => {
  const page = await open(1440, 960, '')
  await page.getByRole('button', { name: 'Call the pitch' }).click()
  await page.getByRole('button', { name: 'Deal' }).click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${out}/call-inflight.png` })
  await page.getByRole('group', { name: 'What spin is it' }).getByRole('button', { name: 'Knuckler' }).click()
  await page.getByRole('group', { name: 'Swing or take' }).getByRole('button', { name: 'Take' }).click()
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${out}/call-result.png` })
  await page.close()
})
}

await browser.close()
await writeFile(`${out}/console.txt`, log.join('\n') + '\n')
console.log(log.join('\n'))
