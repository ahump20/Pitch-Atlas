import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { CompareProvider } from '../compare/CompareProvider'
import { useCompare } from '../compare/compareContext'
import { useInspectorParam } from './useInspector'

/*
  The bench's address: opening adds one history entry, everything that changes what
  the open bench shows rewrites it, and closing leaves the reader exactly where the
  list was, with no entry gained however they wandered in between.
*/
function Bench() {
  const api = useInspectorParam()
  const compare = useCompare()
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output data-testid="at">{location.pathname + location.search}</output>
      <output data-testid="bench">{`${api.slug}|${api.partner}|${api.aspect}`}</output>
      <output data-testid="pair">{`${compare?.selection.a}|${compare?.selection.b}`}</output>
      <button type="button" onClick={() => api.open('slider', { aspect: 'grip' })}>open</button>
      <button type="button" onClick={() => api.open('slider', { partner: 'cutter', aspect: 'card' })}>pair</button>
      <button type="button" onClick={() => api.set({ aspect: 'release' })}>release</button>
      <button type="button" onClick={() => api.close()}>close</button>
      <button type="button" onClick={() => navigate('/pitch/slider')}>chapter</button>
      <button type="button" onClick={() => navigate(-1)}>back</button>
    </>
  )
}

function renderAt(url: string) {
  render(
    <MemoryRouter initialEntries={['/start', url]} initialIndex={1}>
      <CompareProvider>
        <Bench />
      </CompareProvider>
    </MemoryRouter>,
  )
  return userEvent.setup()
}

const at = () => screen.getByTestId('at').textContent
const bench = () => screen.getByTestId('bench').textContent
const press = (user: ReturnType<typeof userEvent.setup>, name: string) => user.click(screen.getByRole('button', { name }))

describe('the bench address', () => {
  it('opens over the list and closes back onto it without gaining an entry', async () => {
    const user = renderAt('/repertoire/?family=breaking')
    await press(user, 'open')
    expect(at()).toBe('/repertoire/?family=breaking&inspect=slider&aspect=grip')
    await press(user, 'close')
    expect(at()).toBe('/repertoire/?family=breaking')
    await press(user, 'back')
    expect(at()).toBe('/start')
  })

  it('changes aspect in place, so one close still lands on the list', async () => {
    const user = renderAt('/repertoire/?family=breaking')
    await press(user, 'open')
    await press(user, 'release')
    expect(bench()).toBe('slider|null|release')
    await press(user, 'close')
    expect(at()).toBe('/repertoire/?family=breaking')
    await press(user, 'back')
    expect(at()).toBe('/start')
  })

  it('a second open of what is already open adds nothing', async () => {
    const user = renderAt('/repertoire/')
    await press(user, 'open')
    await press(user, 'open')
    await press(user, 'close')
    await press(user, 'back')
    expect(at()).toBe('/start')
  })

  it('after a trip to the chapter and Back, Close still returns to the list without a stray entry', async () => {
    const user = renderAt('/repertoire/?family=breaking')
    await press(user, 'open')
    await press(user, 'chapter')
    expect(at()).toBe('/pitch/slider')
    await press(user, 'back')
    expect(bench()).toBe('slider|null|grip')
    await press(user, 'close')
    expect(at()).toBe('/repertoire/?family=breaking')
    await press(user, 'back')
    expect(at()).toBe('/start')
  })

  it('closes a shared link in place', async () => {
    const user = renderAt('/repertoire/?family=breaking&inspect=slider&aspect=flight')
    expect(bench()).toBe('slider|null|flight')
    await press(user, 'close')
    expect(at()).toBe('/repertoire/?family=breaking')
    await press(user, 'back')
    expect(at()).toBe('/start')
  })

  it('drops a partner that is not a different filed pitch', () => {
    renderAt('/?inspect=slider&with=constructor')
    expect(bench()).toBe('slider|null|card')
  })

  it('drops a partner that is the same pitch', () => {
    renderAt('/?inspect=slider&with=slider')
    expect(bench()).toBe('slider|null|card')
  })

  it('a pair opens on the hands, never the card, and becomes the comparison tray pair', async () => {
    const user = renderAt('/')
    await press(user, 'pair')
    expect(bench()).toBe('slider|cutter|grip')
    expect(screen.getByTestId('pair').textContent).toBe('slider|cutter')
  })

  it('reads a pair link on the card as the grip', () => {
    renderAt('/?inspect=slider&with=cutter&aspect=card')
    expect(bench()).toBe('slider|cutter|grip')
  })
})
