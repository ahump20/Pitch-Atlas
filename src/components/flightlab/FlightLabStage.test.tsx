import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_STANCE } from '../../lib/slowpitch'
import { FlightLabStage } from './FlightLabStage'
import { buildLabModel, defaultLobParams } from './model'

/*
  When the 3D scene throws, the stage falls back to the schematic and says so,
  so the page can take away the camera buttons that only the scene answers.
*/

vi.mock('../../hooks/useWebGLSupport', () => ({ useWebGLSupport: () => true }))
vi.mock('./three/FlightLabScene', () => ({
  default: () => {
    throw new Error('context lost')
  },
}))

const model = () =>
  buildLabModel({ rule: 'usssa', stance: { ...DEFAULT_STANCE }, compareIn: 0, params: defaultLobParams(), selected: 'belt' })

describe('FlightLabStage', () => {
  it('reports the fallback when the scene throws', async () => {
    const onSceneLost = vi.fn()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container, findByRole } = render(<FlightLabStage model={model()} view="zone" slow={false} onSceneLost={onSceneLost} />)
    await findByRole('img')
    await vi.waitFor(() => expect(onSceneLost).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[data-stage-loading]')).toBeNull()
    spy.mockRestore()
  })
})
