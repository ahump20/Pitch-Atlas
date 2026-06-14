import { strict as assert } from 'node:assert'
import { chromium } from '@playwright/test'

const rawOrigin = process.argv[2] ?? process.env.PREVIEW_URL

if (!rawOrigin) {
  throw new Error('Pass a preview origin as argv[2] or PREVIEW_URL.')
}

const origin = rawOrigin.replace(/\/+$/, '')
const failures = []

function record(condition, message) {
  if (!condition) failures.push(message)
}

function route(path) {
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

async function pageText(page) {
  return page.locator('body').innerText({ timeout: 10_000 })
}

function includesText(text, pattern) {
  return pattern.test(text.replace(/\s+/g, ' '))
}

async function collectConsole(page, callback) {
  const messages = []
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      messages.push(`${message.type()}: ${message.text()}`)
    }
  })
  await callback()
  return messages.filter(
    (message) =>
      !message.includes('THREE.Clock: This module has been deprecated') &&
      !message.includes('GL Driver Message'),
  )
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  record(
    overflow.scrollWidth <= overflow.clientWidth + 2,
    `${label} has horizontal overflow: ${overflow.scrollWidth}px > ${overflow.clientWidth}px`,
  )
}

async function assertVisible(page, selector, label) {
  const locator = page.locator(selector).first()
  try {
    await locator.waitFor({ state: 'attached', timeout: 10_000 })
  } catch {
    record(false, `${label} was not attached`)
    return
  }

  const deadline = Date.now() + 10_000
  let box = null

  while (Date.now() < deadline) {
    box = await page.evaluate((target) => {
      const el = document.querySelector(target)
      if (!el) return null
      const rect = el.getBoundingClientRect()
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      }
    }, selector)
    if (box && box.width > 0 && box.height > 0) break
    await page.waitForTimeout(100)
  }

  const viewport = page.viewportSize()
  record(Boolean(box), `${label} was not rendered`)
  if (!box || !viewport) return
  record(box.width > 0 && box.height > 0, `${label} rendered with empty dimensions`)
  record(box.x < viewport.width && box.y < viewport.height, `${label} starts outside the first viewport`)
}

async function checkRepertoire(page, viewport) {
  await page.setViewportSize(viewport)
  const messages = await collectConsole(page, async () => {
    await page.goto(route('/repertoire/?q=curve&family=breaking&view=binder'), { waitUntil: 'domcontentloaded' })
    await page.locator('h1').waitFor({ state: 'attached' })
    await page
      .waitForFunction(() => {
        const searchValue = document.querySelector('input[type="search"]')?.value
        const activeControls = [...document.querySelectorAll('[data-state="on"]')].map((el) =>
          el.textContent?.replace(/\s+/g, ' ').trim(),
        )
        return searchValue === 'curve' && activeControls.includes('Breaking') && activeControls.includes('Binder')
      })
      .catch(() => undefined)
  })

  record(page.url().includes('/repertoire/?q=curve&family=breaking&view=binder'), 'Pitch Index URL state was not preserved')
  assert.equal(await page.title(), 'The Pitch Index: every pitch, by family | Pitch Atlas')

  const body = await pageText(page)
  record(includesText(body, /the pitch index/i), 'Pitch Index body did not render')
  record(!body.includes('Loading...'), 'Pitch Index is stuck in a loading state')
  record(messages.length === 0, `Pitch Index console warnings/errors: ${messages.join(' | ')}`)

  const dom = await page.evaluate(() => {
    const activeControls = [...document.querySelectorAll('[data-state="on"]')].map((el) =>
      el.textContent?.replace(/\s+/g, ' ').trim(),
    )
    const schema = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => script.textContent ?? '')
      .join('\n')
    return {
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      searchValue: document.querySelector('input[type="search"]')?.value,
      activeControls,
      hasReset: [...document.querySelectorAll('button')].some((button) => button.textContent?.includes('Reset')),
      hasSearchAction: schema.includes('SearchAction'),
      staleMetadata: schema.includes('five pitches') || schema.includes('2026-06-04'),
    }
  })

  record(dom.canonical === 'https://pitch-atlas.com/repertoire/', `Pitch Index canonical was ${dom.canonical}`)
  record(dom.searchValue === 'curve', `Pitch Index search value was ${dom.searchValue}`)
  record(dom.activeControls.includes('Breaking'), 'Breaking filter was not active')
  record(dom.activeControls.includes('Binder'), 'Binder view was not active')
  record(dom.hasReset, 'Reset control was not visible for active Pitch Index state')
  record(dom.hasSearchAction, 'SearchAction schema missing from Pitch Index')
  record(!dom.staleMetadata, 'Stale Pitch Index metadata returned')

  await assertVisible(page, 'h1', 'Pitch Index heading')
  await assertVisible(page, 'input[type="search"]', 'Pitch Index search')
  await assertVisible(page, '[data-state="on"]', 'Pitch Index active controls')
  await assertNoHorizontalOverflow(page, `Pitch Index ${viewport.width}x${viewport.height}`)
}

async function checkHomeMobileMenu(page) {
  await page.setViewportSize({ width: 390, height: 844 })
  const messages = await collectConsole(page, async () => {
    await page.goto(route('/'), { waitUntil: 'domcontentloaded' })
    await page.locator('main').waitFor({ state: 'attached' })
  })

  assert.equal(await page.title(), 'Pitch Atlas: The Living Field Manual for Pitching Grips')
  const body = await pageText(page)
  record(includesText(body, /pitch atlas/i), 'Home body did not render')
  record(messages.length === 0, `Home mobile console warnings/errors: ${messages.join(' | ')}`)
  await assertVisible(page, 'header', 'Home mobile masthead')
  await assertVisible(page, 'main', 'Home mobile main')
  await assertNoHorizontalOverflow(page, 'Home mobile')

  const menuButton = page.locator('button[aria-controls="mobile-nav"]')
  let menuOpened = false
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await menuButton.click()
    menuOpened = await page
      .waitForFunction(() => {
        const button = document.querySelector('button[aria-controls="mobile-nav"]')
        return button?.getAttribute('aria-expanded') === 'true' && Boolean(document.querySelector('#mobile-nav'))
      }, undefined, { timeout: 2_000 })
      .then(() => true)
      .catch(() => false)
    if (menuOpened) break
    await page.waitForTimeout(500)
  }
  record(menuOpened, 'Mobile menu did not open after hydration')
  if (!menuOpened) return

  await page.locator('#mobile-nav').waitFor({ state: 'attached' })
  const labels = await page.locator('#mobile-nav a').evaluateAll((links) =>
    links.map((link) => link.textContent?.replace(/\s+/g, ' ').trim()),
  )
  record(labels.includes('Pitch Index'), 'Mobile menu is missing Pitch Index')
  record(labels.includes('Softball'), 'Mobile menu is missing Softball')
  record((await menuButton.getAttribute('aria-expanded')) === 'true', 'Mobile menu did not mark itself expanded')

  await page.keyboard.press('Escape')
  await page.locator('#mobile-nav').waitFor({ state: 'detached' })
  record((await menuButton.getAttribute('aria-expanded')) === 'false', 'Mobile menu did not close on Escape')
}

async function checkFourSeam(page) {
  await page.setViewportSize({ width: 1280, height: 900 })
  const messages = await collectConsole(page, async () => {
    await page.goto(route('/pitch/four-seam/'), { waitUntil: 'domcontentloaded' })
    await page.locator('h1').waitFor({ state: 'attached' })
  })

  assert.equal(await page.title(), 'Four-seam fastball: grip, release, and movement | Pitch Atlas')
  const body = await pageText(page)
  record(includesText(body, /four-seam fastball/i), 'Four-seam page body did not render')
  record(includesText(body, /sourced, not corrected/i), 'Four-seam page lost the source principle')
  record(messages.length === 0, `Four-seam console warnings/errors: ${messages.join(' | ')}`)

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
  record(canonical === 'https://pitch-atlas.com/pitch/four-seam/', `Four-seam canonical was ${canonical}`)
  await assertVisible(page, 'h1', 'Four-seam heading')
  await assertNoHorizontalOverflow(page, 'Four-seam desktop')
}

const browser = await chromium.launch({ headless: true })

async function withPage(callback) {
  const page = await browser.newPage()
  try {
    await callback(page)
  } finally {
    await page.close()
  }
}

try {
  await withPage((page) => checkRepertoire(page, { width: 1280, height: 900 }))
  await withPage((page) => checkRepertoire(page, { width: 390, height: 844 }))
  await withPage(checkHomeMobileMenu)
  await withPage(checkFourSeam)
} finally {
  await browser.close()
}

if (failures.length > 0) {
  throw new Error(`Preview browser smoke failed:\n- ${failures.join('\n- ')}`)
}

console.log(`Preview browser smoke passed for ${origin}`)
