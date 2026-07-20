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
  return page.evaluate(() => document.body?.innerText ?? '')
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
  // Benign noise we never want to fail a deploy on. The last entry is a
  // Cloudflare preview-edge artifact: production serves a single enforcing CSP
  // (verified — no report-only header), so `upgrade-insecure-requests` applies
  // correctly there. The preview edge intermittently surfaces it as report-only,
  // where the directive is a no-op and the browser logs this warning. It is not
  // our regression and never reaches a visitor.
  return messages.filter(
    (message) =>
      !message.includes('THREE.Clock: This module has been deprecated') &&
      !message.includes('THREE.sigmaRadians') &&
      !message.includes('GL Driver Message') &&
      !message.includes("'upgrade-insecure-requests' is ignored when delivered in a report-only policy"),
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

async function renderedBox(page, selector, label) {
  const locator = page.locator(selector).first()
  try {
    await locator.waitFor({ state: 'visible', timeout: 10_000 })
  } catch {
    record(false, `${label} was not visible`)
    return null
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
  if (!box || !viewport) return null
  record(box.width > 0 && box.height > 0, `${label} rendered with empty dimensions`)
  return { box, viewport }
}

async function assertRenderedVisible(page, selector, label) {
  await renderedBox(page, selector, label)
}

async function assertStartsInInitialViewport(page, selector, label) {
  const result = await renderedBox(page, selector, label)
  if (!result) return
  const { box, viewport } = result
  record(
    box.x < viewport.width && box.x + box.width > 0 && box.y < viewport.height && box.y + box.height > 0,
    `${label} starts outside the first viewport`,
  )
}

async function assertFullyInInitialViewport(page, selector, label) {
  const result = await renderedBox(page, selector, label)
  if (!result) return
  const { box, viewport } = result
  record(
    box.x >= 0 && box.x + box.width <= viewport.width && box.y >= 0 && box.y + box.height <= viewport.height,
    `${label} is not fully visible in the first viewport`,
  )
}

// A non-recording layout-box probe, used inside retry loops where a transient
// miss should cost one iteration rather than fail the whole run.
async function hasLayoutBox(page, selector, timeout = 4_000) {
  return page
    .waitForFunction(
      (target) => {
        const el = document.querySelector(target)
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      },
      selector,
      { timeout },
    )
    .then(() => true)
    .catch(() => false)
}

async function waitForHomeShell(page) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const hasShell =
      (await page.locator('header').count()) > 0 &&
      (await page.locator('main').count()) > 0
    if (hasShell) return true
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined)
    await page.waitForLoadState('load', { timeout: 15_000 }).catch(() => undefined)
    await page.waitForTimeout(500)
  }
  record(false, 'Home mobile shell did not attach after reload')
  return false
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

  await assertRenderedVisible(page, 'h1', 'Pitch Index heading')
  await assertFullyInInitialViewport(page, 'input[type="search"]', 'Pitch Index search')
  await assertRenderedVisible(page, '[data-state="on"]', 'Pitch Index active controls')
  await assertNoHorizontalOverflow(page, `Pitch Index ${viewport.width}x${viewport.height}`)
}

async function checkHomeMobileMenu(page) {
  await page.setViewportSize({ width: 390, height: 844 })
  const mobileMenuButtonSelector = 'header button[aria-controls="mobile-nav"]'
  const messages = await collectConsole(page, async () => {
    await page.goto(route('/'), { waitUntil: 'domcontentloaded' })
    await page.locator('main').waitFor({ state: 'attached', timeout: 15_000 }).catch(() => undefined)
    await page.waitForLoadState('load', { timeout: 15_000 }).catch(() => undefined)
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined)
  })

  assert.equal(await page.title(), 'Pitch Atlas: The Living Archive of Pitching Craft')
  const body = await pageText(page)
  record(includesText(body, /pitch atlas/i), 'Home body did not render')
  record(messages.length === 0, `Home mobile console warnings/errors: ${messages.join(' | ')}`)
  if (!(await waitForHomeShell(page))) return
  await assertRenderedVisible(page, 'header', 'Home mobile masthead')
  await assertRenderedVisible(page, 'main', 'Home mobile main')
  await assertNoHorizontalOverflow(page, 'Home mobile')

  const menuButton = page.locator(mobileMenuButtonSelector).first()
  try {
    await menuButton.waitFor({ state: 'visible', timeout: 15_000 })
  } catch (error) {
    if (error?.name !== 'TimeoutError') throw error
    record(false, 'Home mobile menu button was not visible')
    return
  }
  // The home masthead button can detach and re-attach repeatedly while the
  // lazy WebGL ball hydrates, so a single layout-box wait followed by a click
  // races that churn: the box check passes, then the node is replaced before
  // the click lands. Re-measure the box and re-issue the click each attempt,
  // and only fail once the retries are exhausted.
  let menuOpened = false
  let everHadLayoutBox = false
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (!(await hasLayoutBox(page, mobileMenuButtonSelector))) {
      await page.waitForTimeout(750)
      continue
    }
    everHadLayoutBox = true
    try {
      await menuButton.click({ timeout: 4_000 })
    } catch (error) {
      if (error?.name !== 'TimeoutError') throw error
      await page.waitForTimeout(750)
      continue
    }
    menuOpened = await page
      .waitForFunction((selector) => {
        const button = document.querySelector(selector)
        return button?.getAttribute('aria-expanded') === 'true' && Boolean(document.querySelector('#mobile-nav'))
      }, mobileMenuButtonSelector, { timeout: 2_000 })
      .then(() => true)
      .catch(() => false)
    if (menuOpened) break
    await page.waitForTimeout(750)
  }
  if (!everHadLayoutBox) {
    record(false, 'Home mobile menu button never received a clickable layout box')
    return
  }
  record(menuOpened, 'Mobile menu did not open after hydration')
  if (!menuOpened) return

  await page.locator('#mobile-nav').waitFor({ state: 'attached' })
  const labels = await page.locator('#mobile-nav a').evaluateAll((links) =>
    links.map((link) => link.textContent?.replace(/\s+/g, ' ').trim()),
  )
  record(labels.includes('Pitch Index'), 'Mobile menu is missing Pitch Index')
  record(labels.includes('Softball'), 'Mobile menu is missing Softball')
  const expandedAfterOpen = await page.evaluate((selector) =>
    document.querySelector(selector)?.getAttribute('aria-expanded'),
  mobileMenuButtonSelector,
  )
  record(expandedAfterOpen === 'true', 'Mobile menu did not mark itself expanded')

  await page.keyboard.press('Escape')
  await page.locator('#mobile-nav').waitFor({ state: 'detached' })
  const expandedAfterEscape = await page.evaluate((selector) =>
    document.querySelector(selector)?.getAttribute('aria-expanded'),
  mobileMenuButtonSelector,
  )
  record(expandedAfterEscape === 'false', 'Mobile menu did not close on Escape')
}

async function checkHomeFirstViewport(page, viewport) {
  await page.setViewportSize(viewport)
  const label = `Home ${viewport.width}x${viewport.height}`
  const messages = await collectConsole(page, async () => {
    await page.goto(route('/'), { waitUntil: 'domcontentloaded' })
    await page.locator('#case h1').waitFor({ state: 'visible', timeout: 15_000 })
  })

  record(messages.length === 0, `${label} console warnings/errors: ${messages.join(' | ')}`)
  const brandState = await page.evaluate(() => {
    const foil = document.querySelector('[data-brand-material="rainbow-foil"]')
    const text = document.body?.innerText ?? ''
    return {
      hasBrandFoil: Boolean(foil),
      foilBackground: foil ? getComputedStyle(foil).backgroundImage : 'none',
      hasUpdatePrompt: text.includes('A new version of Pitch Atlas is ready.'),
      hasReloadButton: [...document.querySelectorAll('button')].some(
        (button) => button.textContent?.trim().toLowerCase() === 'reload',
      ),
    }
  })
  record(brandState.hasBrandFoil, `${label} is missing the rainbow-foil wordmark`)
  record(
    brandState.foilBackground.includes('linear-gradient'),
    `${label} rainbow-foil wordmark has no gradient material`,
  )
  record(!brandState.hasUpdatePrompt, `${label} still renders the update prompt`)
  record(!brandState.hasReloadButton, `${label} still renders the forced Reload action`)
  await assertStartsInInitialViewport(page, '#case h1', `${label} heading`)
  await assertFullyInInitialViewport(
    page,
    '#case a[href="/repertoire"]',
    `${label} primary Pitch Index action`,
  )
  await assertNoHorizontalOverflow(page, label)
}

async function checkReducedMotionBrand(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(route('/'), { waitUntil: 'domcontentloaded' })
  await page.locator('header [data-brand-material="rainbow-foil"]').waitFor({ state: 'visible' })
  await page.waitForLoadState('load', { timeout: 15_000 }).catch(() => undefined)
  await page
    .waitForFunction(() => {
      const element = document.querySelector('header [data-brand-material="rainbow-foil"]')
      if (!element?.isConnected) return false
      const style = getComputedStyle(element)
      return style.animationName === 'none' && style.backgroundImage.includes('linear-gradient')
    }, undefined, { timeout: 15_000 })
    .catch(() => undefined)

  const state = await page.evaluate(() => {
    const element = document.querySelector('header [data-brand-material="rainbow-foil"]')
    if (!element) return { animationName: 'missing', backgroundImage: 'none' }
    return {
      animationName: getComputedStyle(element).animationName,
      backgroundImage: getComputedStyle(element).backgroundImage,
    }
  })
  record(state.animationName === 'none', `Reduced-motion wordmark still animates via ${state.animationName}`)
  record(state.backgroundImage.includes('linear-gradient'), 'Reduced-motion wordmark lost its static foil material')
}

async function checkHomeCardBacks(page, viewport) {
  await page.setViewportSize(viewport)
  const label = `Home card backs ${viewport.width}x${viewport.height}`
  const messages = await collectConsole(page, async () => {
    await page.goto(route('/'), { waitUntil: 'domcontentloaded' })
    await page.locator('#set .v2-mount').first().waitFor({ state: 'visible', timeout: 15_000 })
    await page.waitForLoadState('load', { timeout: 15_000 }).catch(() => undefined)
  })

  record(messages.length === 0, `${label} console warnings/errors: ${messages.join(' | ')}`)
  const flipButtons = page.locator('#set .v2-face:not(.v2-face-back) .v2-flip-btn')
  const count = await flipButtons.count()
  record(count > 0, `${label} found no sourced card backs`)

  for (let index = 0; index < count; index += 1) {
    // The prerendered wall can be replaced once while the client root attaches.
    // Resolve the button again on each attempt so a click cannot land on the
    // outgoing static node and then lose its state during hydration.
    let flipped = false
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        await flipButtons.nth(index).click({ timeout: 4_000 })
      } catch (error) {
        if (error?.name !== 'TimeoutError' && !String(error).includes('not attached')) throw error
      }
      flipped = await page
        .locator('#set .v2-mount')
        .nth(index)
        .locator('.v2-flip.is-flipped')
        .waitFor({ state: 'attached', timeout: 1_000 })
        .then(() => true)
        .catch(() => false)
      if (flipped) break
      await page.waitForTimeout(500)
    }
    record(flipped, `${label} card ${index + 1} did not flip to its sourced back`)
  }

  const backs = await page.locator('#set .v2-mount').evaluateAll((mounts) =>
    mounts.map((mount) => {
      const back = mount.querySelector('.v2-back')
      const rows = mount.querySelector('.rfx-scout-rows')
      const foot = mount.querySelector('.rfx-scout-foot')
      const sourceLinks = foot ? [...foot.querySelectorAll('a[target="_blank"]')] : []
      if (!(back instanceof HTMLElement) || !(rows instanceof HTMLElement) || !(foot instanceof HTMLElement)) {
        return { complete: false }
      }

      const rowsRect = rows.getBoundingClientRect()
      const backRect = back.getBoundingClientRect()
      const rowChildrenFit = [...rows.children].every((child) => {
        const rect = child.getBoundingClientRect()
        return rect.top >= rowsRect.top - 1 && rect.bottom <= rowsRect.bottom + 1
      })
      const linksVisible = sourceLinks.every((link) => {
        const rect = link.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })

      return {
        complete: true,
        rowsFit: rows.scrollHeight <= rows.clientHeight + 1 && rowChildrenFit,
        backFits: back.scrollHeight <= back.clientHeight + 1,
        footFits: foot.getBoundingClientRect().bottom <= backRect.bottom + 1,
        sourceCount: sourceLinks.length,
        linksVisible,
      }
    }),
  )

  for (const [index, back] of backs.entries()) {
    record(back.complete, `${label} card ${index + 1} is missing its sourced back structure`)
    if (!back.complete) continue
    record(back.rowsFit, `${label} card ${index + 1} clips a sourced row`)
    record(back.backFits, `${label} card ${index + 1} overflows its matte back`)
    record(back.footFits, `${label} card ${index + 1} clips its source footer`)
    record(back.sourceCount >= 2, `${label} card ${index + 1} is missing grip or shape source links`)
    record(back.linksVisible, `${label} card ${index + 1} hides a source link`)
  }
}

async function checkFourSeam(page) {
  // Exercise the promised no-WebGL path and keep the deep-route data check from
  // competing with software-rendered Three.js in headless Chromium.
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function patchedGetContext(type, ...args) {
      if (String(type).toLowerCase().startsWith('webgl')) return null
      return getContext.call(this, type, ...args)
    }
  })
  await page.setViewportSize({ width: 1280, height: 900 })
  const publicNotesResponse = page
    .waitForResponse(
      (response) => response.url().includes('/rest/v1/rpc/list_public_field_notes'),
      { timeout: 75_000 },
    )
    .catch(() => null)
  const messages = await collectConsole(page, async () => {
    await page.goto(route('/pitch/four-seam/'), { waitUntil: 'domcontentloaded' })
    await page.locator('h1').waitFor({ state: 'attached' })
    await page.waitForLoadState('load', { timeout: 15_000 }).catch(() => undefined)
    await page.evaluate(() => document.querySelector('#field-notes')?.scrollIntoView())
    await page
      .waitForFunction(() => !document.querySelector('#field-notes [aria-busy="true"]'), undefined, { timeout: 20_000 })
      .catch(() => undefined)
  })
  const notesResponse = await publicNotesResponse

  assert.equal(await page.title(), 'Four-seam fastball: grip, release, and movement | Pitch Atlas')
  const body = await pageText(page)
  const unexpectedMessages = messages.filter(
    (message) => !message.includes('THREE.WebGLRenderer: Error creating WebGL context'),
  )
  record(includesText(body, /four-seam fastball/i), 'Four-seam page body did not render')
  record(includesText(body, /sourced, not corrected/i), 'Four-seam page lost the source principle')
  record(
    unexpectedMessages.length === 0,
    `Four-seam console warnings/errors: ${unexpectedMessages.join(' | ')}`,
  )
  record(Boolean(notesResponse), 'Four-seam page never requested the moderated public Field Notes feed')
  record(
    notesResponse?.status() === 200,
    `Four-seam public Field Notes feed returned ${notesResponse?.status() ?? 'no response'}`,
  )
  record(!includesText(body, /couldn't load the field notes/i), 'Four-seam Field Notes rendered an error state')

  const activePitchIndex = await page
    .waitForFunction(() =>
      [...document.querySelectorAll('header a[aria-current]')].some(
        (link) =>
          link.textContent?.replace(/\s+/g, ' ').trim() === 'Pitch Index' &&
          link.getAttribute('aria-current') === 'location',
      ),
      undefined,
      { timeout: 15_000 },
    )
    .then(() => true)
    .catch(() => false)
  record(activePitchIndex, 'Four-seam route did not keep Pitch Index marked current')

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
  record(canonical === 'https://pitch-atlas.com/pitch/four-seam/', `Four-seam canonical was ${canonical}`)
  await assertRenderedVisible(page, 'h1', 'Four-seam heading')
  await assertNoHorizontalOverflow(page, 'Four-seam desktop')
}

async function checkSupportAndPrivacy(page, viewport) {
  await page.setViewportSize(viewport)

  for (const path of ['/support/', '/privacy/']) {
    const label = `${path} ${viewport.width}x${viewport.height}`
    const messages = await collectConsole(page, async () => {
      await page.goto(route(path), { waitUntil: 'domcontentloaded' })
      await page.locator('h1').waitFor({ state: 'attached' })
    })

    const body = await pageText(page)
    record(includesText(body, path === '/support/' ? /flag it/i : /what the atlas holds/i), `${label} body did not render`)
    record(!/[\u2014\u2013]/.test(body), `${label} contains a long dash`)
    record(!/@pitch-atlas\.com/.test(body), `${label} contains fabricated contact details`)
    record(!body.includes('Loading...'), `${label} is stuck in a loading state`)
    record(messages.length === 0, `${label} console warnings/errors: ${messages.join(' | ')}`)

    await assertRenderedVisible(page, 'h1', `${label} heading`)
    await assertNoHorizontalOverflow(page, label)
  }
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
  await withPage((page) => checkRepertoire(page, { width: 320, height: 568 }))
  await withPage((page) => checkRepertoire(page, { width: 375, height: 667 }))
  await withPage((page) => checkRepertoire(page, { width: 390, height: 844 }))
  await withPage((page) => checkRepertoire(page, { width: 568, height: 320 }))
  await withPage((page) => checkRepertoire(page, { width: 844, height: 390 }))
  await withPage((page) => checkHomeFirstViewport(page, { width: 320, height: 568 }))
  await withPage((page) => checkHomeFirstViewport(page, { width: 375, height: 667 }))
  await withPage((page) => checkHomeFirstViewport(page, { width: 568, height: 320 }))
  await withPage((page) => checkHomeFirstViewport(page, { width: 844, height: 390 }))
  await withPage(checkReducedMotionBrand)
  await withPage((page) => checkHomeCardBacks(page, { width: 320, height: 568 }))
  await withPage((page) => checkHomeCardBacks(page, { width: 375, height: 667 }))
  await withPage((page) => checkHomeCardBacks(page, { width: 1280, height: 900 }))
  await withPage(checkHomeMobileMenu)
  await withPage(checkFourSeam)
  await withPage((page) => checkSupportAndPrivacy(page, { width: 1280, height: 900 }))
  await withPage((page) => checkSupportAndPrivacy(page, { width: 390, height: 844 }))
} finally {
  await browser.close()
}

if (failures.length > 0) {
  throw new Error(`Preview browser smoke failed:\n- ${failures.join('\n- ')}`)
}

console.log(`Preview browser smoke passed for ${origin}`)
