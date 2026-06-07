import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

if (!window.PointerEvent) {
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: MouseEvent,
  })
}

if (!window.HTMLElement.prototype.hasPointerCapture) {
  Object.defineProperties(window.HTMLElement.prototype, {
    hasPointerCapture: {
      configurable: true,
      value: () => false,
    },
    setPointerCapture: {
      configurable: true,
      value: () => undefined,
    },
    releasePointerCapture: {
      configurable: true,
      value: () => undefined,
    },
  })
}

if (!window.HTMLElement.prototype.scrollIntoView) {
  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => undefined,
  })
}

afterEach(() => {
  cleanup()
})
