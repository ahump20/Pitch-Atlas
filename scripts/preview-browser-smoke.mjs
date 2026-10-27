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

const OFFICIAL_EMBED_HOSTS = [
  'tiktok.com',
  'tiktokcdn',
  'x.com',
  'twitter.com',
  'twimg.com',
  'youtube.com',
  'googlevideo.com',
  'instagram.com',
  'cdninstagram.com',
]

function isExpectedExternalMediaNoise(message) {
  const preMigrationShelfProbe =
    message.includes('Failed to load resource: the server responded with a status of 404') &&
    message.includes('.supabase.co/rest/v1/external_content_items?')
  // Match on where the message CAME FROM (the ` @ url` suffix collectConsole
  // appends), never on its text. Matching the text silenced any real Pitch Atlas
  // failure that merely mentioned a provider host — a blocked frame, a CSP
  // violation, a React error whose markup diff contains an embed src.
  const at = message.lastIndexOf(' @ ')
  const sourceUrl = at === -1 ? '' : message.slice(at + 3)
  const officialEmbedMessage =
    sourceUrl !== '' && OFFICIAL_EMBED_HOSTS.some((host) => sourceUrl.includes(host))
  return preMigrationShelfProbe || officialEmbedMessage
}

async function collectConsole(page, callback) {
  const messages = []
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      const sourceUrl = message.location().url
      messages.push(`${message.type()}: ${message.text()}${sourceUrl ? ` @ ${sourceUrl}` : ''}`)
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
      !isExpectedExternalMediaNoise(message) &&
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

  assert.equal(await page.title(), 'Pitch Atlas: The Living Museum of Pitching Craft')
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
  const externalCards = await page.locator('[data-external-provider]').count()
  record(externalCards >= 3, `${label} lost the committed external-media fallback shelf`)
  const flipButtons = page.locator('#set .archive-wall-source')
  const count = await flipButtons.count()
  record(count > 0, `${label} found no sourced card backs`)

  for (let index = 0; index < count; index += 1) {
    // The prerendered wall can be replaced once while the client root attaches.
    // Resolve the button again on each attempt so a click cannot land on the
    // outgoing static node and then lose its state during hydration.
    let flipped = false
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const mount = page.locator('#set .v2-mount').nth(index)
      if (await mount.locator('.v2-flip.is-flipped').count()) {
        flipped = true
        break
      }
      try {
        await flipButtons.nth(index).click({ timeout: 10_000 })
      } catch (error) {
        if (error?.name !== 'TimeoutError' && !String(error).includes('not attached')) throw error
      }
      flipped = await page
        .locator('#set .v2-mount')
        .nth(index)
        .locator('.v2-flip.is-flipped')
        .waitFor({ state: 'attached', timeout: 5_000 })
        .then(() => true)
        .catch(() => false)
      if (flipped) break
      await page.waitForTimeout(500)
    }
    record(flipped, `${label} card ${index + 1} did not flip to its sourced back`)
    if (!flipped) console.error(`${label} card ${index + 1}: aria-pressed=${await flipButtons.nth(index).getAttribute('aria-pressed')}`)
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

async function disableWebGL(page) {
  // Data, focus and scrolling checks do not need software-rendered Three.js.
  // The material itself is checked separately in a browser with WebGL.
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function patchedGetContext(type, ...args) {
      // 'experimental-webgl' too, or detection still finds a context
      if (/webgl/i.test(String(type))) return null
      return getContext.call(this, type, ...args)
    }
  })
}

async function checkFourSeam(page) {
  // Exercise the promised no-WebGL path for this deep-route data check.
  await disableWebGL(page)
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
  record(includesText(body, /every claim, sourced/i), 'Four-seam page lost the visible provenance contract')
  record(
    (await page.locator('[data-external-provider]').count()) > 0,
    'Four-seam page lost its matched external-media fallback',
  )
  record(
    unexpectedMessages.length === 0,
    `Four-seam console warnings/errors: ${unexpectedMessages.join(' | ')}`,
  )
  record(Boolean(notesResponse), 'Four-seam page never requested the moderated public Field Notes feed')
  record(
    notesResponse?.status() === 200,
    `Four-seam public Field Notes feed returned ${notesResponse?.status() ?? 'no response'}`,
  )
  record(
    !includesText(body, /couldn't load the field notes|could not load community notes just now/i),
    'Four-seam Field Notes rendered an error state',
  )

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

// A phone has no Escape key, so the inspector's close button has to be the thing under
// a finger at its own centre, whatever the layout puts beside or beneath it.
async function checkInspectorClose(page, viewport) {
  await page.setViewportSize(viewport)
  const label = `Inspector ${viewport.width}x${viewport.height}`
  await page.goto(route('/?inspect=four-seam'), { waitUntil: 'domcontentloaded' })
  await page.locator('.specimen-inspector .rfx-card').first().waitFor({ state: 'visible', timeout: 20_000 })
  const close = page.getByRole('dialog').getByRole('button', { name: 'Close' })
  const reach = await close
    .evaluate((button) => {
      const r = button.getBoundingClientRect()
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      return {
        inView: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth,
        onTop: hit === button || button.contains(hit),
      }
    })
    .catch(() => ({ inView: false, onTop: false }))
  record(reach.inView, `${label} close button is not in the first viewport`)
  record(reach.onTop, `${label} close button is covered by another element`)
  if (!reach.onTop) return
  await close.click()
  const closed = await page
    .getByRole('dialog')
    .waitFor({ state: 'detached', timeout: 5_000 })
    .then(() => true, () => false)
  record(closed, `${label} close button does not close the inspector`)
  record(!new URL(page.url()).searchParams.has('inspect'), `${label} closing left ?inspect= in the address`)
}

async function checkInspectorReturnFocus(page) {
  await disableWebGL(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(route('/'), { waitUntil: 'domcontentloaded' })
  const opener = page.getByRole('button', { name: 'Inspect card four seam' }).first()
  await opener.focus()
  const scrollY = await page.evaluate(() => window.scrollY)
  for (const close of ['Escape', 'Back']) {
    await opener.press('Enter')
    await page.getByRole('dialog').waitFor({ state: 'visible' })
    if (close === 'Escape') await page.keyboard.press('Escape')
    else await page.goBack()
    await page.getByRole('dialog').waitFor({ state: 'detached' })
    const focused = await page.waitForFunction(() =>
      document.activeElement?.matches('#case button[aria-haspopup="dialog"]'),
      undefined, { timeout: 5_000 },
    ).then(() => true, () => false)
    record(focused, `Inspector ${close} did not return focus to its opener`)
    record(Math.abs(await page.evaluate(() => window.scrollY) - scrollY) <= 2,
      `Inspector ${close} scrolled the collection while returning focus`)
  }
}

// The desktop room has a height cap. A tall viewport must not grow the card past
// that room, and opening the independently scrolling Finish rail must keep it put.
async function checkInspectorCardFits(page) {
  await disableWebGL(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const viewport of [{ width: 1280, height: 900 }, { width: 1440, height: 1000 }, { width: 1920, height: 1080 }, { width: 1280, height: 450 }]) {
    await page.setViewportSize(viewport)
    const label = `Inspector card ${viewport.width}x${viewport.height}`
    await page.goto(route('/?inspect=four-seam'), { waitUntil: 'domcontentloaded' })
    const dialog = page.getByRole('dialog')
    const rig = dialog.locator('.specimen-rig')
    await rig.waitFor({ state: 'visible', timeout: 20_000 })
    const before = await rig.boundingBox()
    for (const face of ['Front', 'Sources']) {
      await dialog.getByRole('button', { name: face, exact: true }).click()
      const bounds = await dialog.evaluate((room) => {
        const card = room.querySelector('.specimen-rig').getBoundingClientRect()
        const box = room.getBoundingClientRect()
        return {
          contained: card.top >= box.top && card.left >= box.left && card.bottom <= box.bottom && card.right <= box.right,
          overflow: room.scrollHeight - room.clientHeight,
        }
      })
      record(bounds.contained, `${label} ${face} clips outside the room`)
      record(bounds.overflow <= 1, `${label} ${face} makes the room scroll by ${bounds.overflow}px`)
    }
    await dialog.getByRole('button', { name: 'Finish', exact: true }).click()
    const after = await rig.boundingBox()
    record(before && after && ['x', 'y', 'width', 'height'].every((key) => Math.abs(before[key] - after[key]) <= 1), `${label} moved when Finish opened`)
  }
}

async function checkReducedMotionInspectorScroll(page) {
  await disableWebGL(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(route('/?inspect=four-seam'), { waitUntil: 'domcontentloaded' })
  const card = page.locator('.specimen-inspector .rfx-card').first()
  await card.waitFor({ state: 'visible', timeout: 20_000 })
  const box = await card.boundingBox()
  assert(box, 'Reduced-motion inspector card has no box')
  const dialog = page.getByRole('dialog')
  const before = await dialog.evaluate((el) => el.scrollTop)
  const session = await page.context().newCDPSession(page)
  try {
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: true })
    const x = box.x + box.width / 2
    const y = Math.min(600, box.y + box.height * 0.75)
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (let step = 1; step <= 10; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 18 }] })
      await page.waitForTimeout(16)
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    const scrolled = await page.waitForFunction((initial) =>
      (document.querySelector('.specimen-inspector')?.scrollTop ?? 0) > initial + 20,
      before, { timeout: 5_000 },
    ).then(() => true, () => false)
    record(scrolled, 'A swipe over the static reduced-motion card did not scroll the inspector')
  } finally {
    await session.detach()
  }
}

// The bench: a filed row opens in place over the list, the aspects and the pair share
// one history entry, and Close lands on the same row of the same filtered list. Software
// WebGL takes tens of seconds to draw the hand, so this walk runs on the seam-informed
// schematic, where Link and Reset step aside; the linked 3D drag is checked in a browser
// with a GPU.
async function checkBench(page, viewport, { reduced = false } = {}) {
  await disableWebGL(page)
  if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize(viewport)
  const label = `Bench ${reduced ? 'reduced-motion ' : ''}${viewport.width}x${viewport.height}`
  const phone = viewport.width < 640
  const unexpected = await collectConsole(page, async () => {
    await page.goto(route('/repertoire/?family=breaking'), { waitUntil: 'domcontentloaded' })
    const row = page.locator('a[href*="/pitch/slider"]').first()
    await row.waitFor({ state: 'visible', timeout: 20_000 })
    await row.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    const listUrl = page.url()
    const scrollY = await page.evaluate(() => window.scrollY)
    await row.click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor({ state: 'visible', timeout: 15_000 })
    const opened = new URL(page.url()).searchParams
    record(opened.get('inspect') === 'slider' && opened.get('aspect') === 'grip' && opened.get('family') === 'breaking',
      `${label} did not open Slider's grip over the filtered list (${page.url()})`)
    record((await dialog.locator('.bench-chip').first().textContent()) === 'Seam-informed schematic',
      `${label} stage without WebGL is not the seam-informed schematic`)
    const depth = await page.evaluate(() => history.length)

    await dialog.getByRole('group', { name: 'Aspect' }).getByRole('button', { name: 'Release' }).click()
    await page.waitForURL(/aspect=release/)
    await dialog.getByLabel('Compare with').selectOption('cutter')
    await page.waitForURL(/with=cutter/)
    record(await page.evaluate(() => history.length) === depth, `${label} aspect or partner added a history entry`)
    record(await dialog.locator('[data-bench-ball]').count() === (phone ? 1 : 2), `${label} pair shows the wrong number of balls`)
    record(await dialog.getByRole('button', { name: /^(Unlink|Link|Reset)$/ }).count() === 0,
      `${label} offers Link or Reset on a schematic, which cannot turn`)
    if (phone) {
      await dialog.getByRole('group', { name: 'Pitch on the stage' }).getByRole('button', { name: /Cutter/ }).click()
      record(await dialog.locator('[data-bench-ball="cutter"]').count() === 1, `${label} A/B switch did not put the Cutter on the stage`)
    }

    await dialog.getByRole('group', { name: 'Aspect' }).getByRole('button', { name: 'Grip' }).click()
    const index = dialog.getByRole('button', { name: /^Index/ })
    await index.click()
    record(await index.getAttribute('aria-pressed') === 'true', `${label} the Index row did not stay picked`)
    record(await dialog.locator('.bench-finger[data-dim]').count() >= 1, `${label} picking a finger faded no other rows`)

    await dialog.getByRole('group', { name: 'Aspect' }).getByRole('button', { name: 'Flight' }).click()
    await dialog.locator('.bench-flight svg').waitFor({ state: 'visible' })
    record(await dialog.locator('[data-flight]').count() === 2, `${label} flight does not draw both paths`)
    record(includesText(await dialog.innerText(), /illustrative/i), `${label} flight is not labeled Illustrative`)
    const numbers = (await dialog.innerText()).match(/\d+\s?(mph|rpm|in\b|inches|°)/g)
    record(!numbers, `${label} shows pitch numbers: ${numbers?.join(', ')}`)
    await assertNoHorizontalOverflow(page, label)

    await dialog.getByRole('button', { name: 'Close' }).click()
    await dialog.waitFor({ state: 'detached', timeout: 5_000 })
    record(page.url() === listUrl, `${label} Close left ${page.url()}, not ${listUrl}`)
    const back = await page.waitForFunction((y) => Math.abs(window.scrollY - y) <= 2, scrollY, { timeout: 5_000 }).then(() => true, () => false)
    record(back, `${label} Close did not restore the list's scroll`)
    record(await page.evaluate(() => document.activeElement?.getAttribute('href')?.includes('/pitch/slider') ?? false),
      `${label} Close did not return focus to the Slider row`)
  })
  record(unexpected.length === 0, `${label} console warnings/errors: ${unexpected.join(' | ')}`)
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

async function checkKnowledgeMarkerWrap(page) {
  await page.setViewportSize({ width: 390, height: 844 })
  const messages = await collectConsole(page, async () => {
    await page.goto(route('/learn/canon/'), { waitUntil: 'domcontentloaded' })
    await page.locator('h1').waitFor({ state: 'visible' })
    await page.locator('[data-stage-tier-marker] h2').first().waitFor({ state: 'visible' })
  })

  const markers = await page.locator('[data-stage-tier-marker]').evaluateAll((elements) =>
    elements.map((element) => {
      const heading = element.querySelector('h2')
      const rect = heading?.getBoundingClientRect()
      return {
        label: heading?.textContent?.replace(/\s+/g, ' ').trim() ?? 'missing heading',
        // text-wrap-mode is the longhand that decides wrapping; the white-space
        // shorthand serializes differently across Chromium builds, so it flaked in CI.
        wrap: heading ? getComputedStyle(heading).textWrapMode || getComputedStyle(heading).whiteSpace : 'missing',
        left: rect?.left ?? -1,
        right: rect?.right ?? Number.POSITIVE_INFINITY,
        viewportWidth: document.documentElement.clientWidth,
      }
    }),
  )

  record(markers.length > 0, 'Canon mobile rendered no section markers')
  for (const marker of markers) {
    record(marker.wrap === 'wrap' || marker.wrap === 'normal', `Canon mobile marker does not wrap (${marker.wrap}): ${marker.label}`)
    record(
      marker.left >= 0 && marker.right <= marker.viewportWidth + 2,
      `Canon mobile marker clips outside the viewport: ${marker.label}`,
    )
  }
  record(messages.length === 0, `Canon mobile console warnings/errors: ${messages.join(' | ')}`)
  await assertNoHorizontalOverflow(page, 'Canon mobile')
}

// The client renders over the prerendered HTML instead of hydrating it
// (src/main.tsx), so every prerendered node is replaced once the client root
// mounts, and until then every control is a dead copy. Over a slow network that
// mount lands well after `load`: a check that clicks first either hits the
// dead copy and tests nothing, or loses the node mid-action ("not attached").
// After parsing, the only thing that removes #app's own children is that mount,
// so the init script flags it. Every smoke route is prerendered.
async function watchClientRoot(page) {
  await page.addInitScript(() => {
    new MutationObserver((records, observer) => {
      if (records.some((r) => r.target instanceof Element && r.target.id === 'app' && r.removedNodes.length > 0)) {
        window.__paClientRoot = true
        observer.disconnect()
      }
    }).observe(document, { childList: true, subtree: true })
  })
}

async function waitForClientRoot(page, label) {
  const mounted = await page
    .waitForFunction(() => window.__paClientRoot === true, undefined, { timeout: 30_000 })
    .then(() => true)
    .catch(() => false)
  record(mounted, `${label} client root never replaced the prerendered page`)
  return mounted
}

async function checkFlightLab(page, viewport, { webgl = true } = {}) {
  // The slow-pitch Flight Lab: the verdict headline leads, Throw runs a lob,
  // and with WebGL switched off the flat schematic is the whole stage.
  await watchClientRoot(page)
  if (!webgl) {
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function patchedGetContext(type, ...args) {
        // 'experimental-webgl' too, or detection still finds a context
        if (/webgl/i.test(String(type))) return null
        return getContext.call(this, type, ...args)
      }
    })
  }
  await page.setViewportSize(viewport)
  const label = `Flight Lab ${webgl ? '' : 'no-WebGL '}${viewport.width}x${viewport.height}`
  // A page that never came up has already failed for that reason, so Throw is
  // only tried, and only judged, on a live page with its stage up.
  let ready = false
  let thrown = false
  const messages = await collectConsole(page, async () => {
    await page.goto(route('/softball/flight-lab/'), { waitUntil: 'domcontentloaded' })
    await page.locator('h1').waitFor({ state: 'attached' })
    await page.waitForLoadState('load', { timeout: 15_000 }).catch(() => undefined)
    if (!(await waitForClientRoot(page, label))) return
    // Poll rather than wait on selectors: the 3D chunk can be slow on a loaded
    // runner. A lob thrown before the scene is up has nothing to fly in.
    ready = await page
      .waitForFunction(() => document.querySelector('[data-stage-ready="true"], [data-stage-mode="schematic"]'), undefined, { timeout: 30_000 })
      .then(() => true)
      .catch(() => false)
    record(ready, `${label} stage never became ready`)
    if (!ready) return
    const throwButton = page.locator('[data-flight-throw]')
    await throwButton.scrollIntoViewIfNeeded()
    await throwButton.click()
    // Throw disables itself while a lob is in the air, so seeing it go disabled
    // is the proof the click reached the live button.
    thrown = await page
      .waitForFunction(() => document.querySelector('[data-flight-throw]')?.hasAttribute('disabled'), undefined, { timeout: 10_000 })
      .then(() => true)
      .catch(() => false)
    await page
      .waitForFunction(() => !document.querySelector('[data-flight-throw]')?.hasAttribute('disabled'), undefined, { timeout: 20_000 })
      .catch(() => undefined)
  })

  if (ready) record(thrown, `${label} Throw never started a lob`)
  const verdict = (await page.locator('[data-flight-verdict]').first().textContent())?.trim() ?? ''
  record(/your pitch|jams you|too low|too high|illegal|ball|off the end/i.test(verdict), `${label} verdict headline missing (got "${verdict}")`)
  const lookFor = (await page.locator('[data-flight-lookfor]').first().textContent())?.trim() ?? ''
  record(/\d+\D+\d+/.test(lookFor), `${label} look-for window missing (got "${lookFor}")`)
  const throwEnabled = await page.locator('[data-flight-throw]').isEnabled()
  record(throwEnabled, `${label} Throw never finished`)
  const mode = await page.locator('[data-stage-mode]').first().getAttribute('data-stage-mode')
  if (!webgl) {
    record(mode === 'schematic', `${label} did not fall back to the schematic (mode ${mode})`)
    record((await page.locator('[data-flight-schematic] svg').count()) > 0, `${label} schematic did not render`)
  }
  const body = await pageText(page)
  record(!/NaN|undefined|\[object Object\]|Loading\.\.\./.test(body), `${label} shows a failure signature`)
  record(!/\brpm\b|\bmph\b/i.test(body), `${label} shows a spin or speed figure`)
  const unexpected = messages.filter((m) => !m.includes('THREE.WebGLRenderer: Error creating WebGL context'))
  record(unexpected.length === 0, `${label} console warnings/errors: ${unexpected.join(' | ')}`)
  await assertRenderedVisible(page, 'h1', `${label} heading`)
  await assertNoHorizontalOverflow(page, label)
}

// An explicit channel or executable lets local verification use installed Chrome when the
// bundled headless shell stalls during WebGL page teardown. CI keeps its
// bundled browser unless the caller opts into a channel.
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
})

let smokeStep = 0
async function withPage(callback) {
  const page = await browser.newPage()
  page.setDefaultTimeout(15_000)
  page.setDefaultNavigationTimeout(30_000)
  console.log(`Smoke ${++smokeStep}/30: ${callback.name || "responsive route"}`)
  try {
    const priorFailures = failures.length
    await callback(page)
    console.log(`${failures.length === priorFailures ? "Passed" : "Failed"} smoke ${smokeStep}: ${page.url()}`)
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
  await withPage((page) => checkInspectorClose(page, { width: 390, height: 844 }))
  await withPage((page) => checkInspectorClose(page, { width: 1280, height: 900 }))
  await withPage(checkInspectorReturnFocus)
  await withPage(checkReducedMotionInspectorScroll)
  await withPage(checkInspectorCardFits)
  await withPage((page) => checkBench(page, { width: 1280, height: 900 }))
  await withPage((page) => checkBench(page, { width: 390, height: 844 }))
  await withPage((page) => checkBench(page, { width: 1280, height: 900 }, { reduced: true }))
  await withPage((page) => checkSupportAndPrivacy(page, { width: 1280, height: 900 }))
  await withPage((page) => checkSupportAndPrivacy(page, { width: 390, height: 844 }))
  await withPage(checkKnowledgeMarkerWrap)
  await withPage((page) => checkFlightLab(page, { width: 1440, height: 900 }))
  await withPage((page) => checkFlightLab(page, { width: 390, height: 844 }))
  await withPage((page) => checkFlightLab(page, { width: 1280, height: 900 }, { webgl: false }))
} finally {
  await browser.close()
}

if (failures.length > 0) {
  throw new Error(`Preview browser smoke failed:\n- ${failures.join('\n- ')}`)
}

console.log(`Preview browser smoke passed for ${origin}`)
