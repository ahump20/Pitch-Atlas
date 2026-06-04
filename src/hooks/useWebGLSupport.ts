function detect(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    return Boolean(gl)
  } catch {
    return false
  }
}

/*
  WebGL availability, detected once at module load (client only). A constant, so
  there is no setState-in-effect and no re-render churn. The 3D ball lazy-loads
  behind the SVG schematic as its Suspense fallback, so a false result simply
  leaves the page on its honest no-WebGL default.
*/
const WEBGL_SUPPORTED: boolean = detect()

export function useWebGLSupport(): boolean {
  return WEBGL_SUPPORTED
}
