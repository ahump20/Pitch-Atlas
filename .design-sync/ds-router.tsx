// DS preview provider. PitchSpecimenCard (→ RefractorCard) renders a
// react-router <Link>, which throws without a Router on the page. The design
// tool mounts each preview cell bare, so we wrap every cell in a MemoryRouter
// via cfg.provider. Bundled into the same _ds_bundle.js as the card, so this
// MemoryRouter shares the one react-router context the card's Link consumes
// (a second copy would not). Harmless for every non-routing component.
import { MemoryRouter } from 'react-router-dom'

export function DsRouter({ children }: { children?: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}
