import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

/*
  A purpose-built studio for one object: a baseball. The leather wants a soft,
  believable thing to reflect, and the red waxed thread wants a tight raking light
  to catch its raised top — so the rig is:

   - a hand-built gradient environment (warm dusk above, cool stage below, a bright
     band near the horizon) baked to a PMREM cube the leather reflects. Built from a
     scratch scene of emissive shells — no CDN HDRI, no runtime asset fetch, so the
     no-external-call honesty contract holds.
   - a warm key from upper-front-right with crisp specular roll-off
   - a cool fill from the lower-left to keep the shadow side from going dead
   - a tight white rim from behind that rakes low across the seam to glint the thread

  PMREM lifecycle (order matters): the gradient scene and the PMREMGenerator are
  scratch — they only bake the cube, so both are disposed the moment generation
  finishes. The generated render target must stay alive the whole time the scene
  reflects its texture; freeing it early would invalidate the very map the lighting
  reads from. So we hold the render target (not just its texture) and dispose it on
  unmount, after drei's <Environment> has already restored scene.environment (its
  layout-effect cleanup runs child-before-parent). One rt.dispose() releases the
  texture and the framebuffers together.
*/

/* A scratch scene whose inside surface is the gradient the ball reflects: a large
   inward-facing sphere with a vertical color ramp, plus two soft emissive panels
   standing in for studio softboxes (one warm, one cool) so highlights have shape. */
function buildGradientScene(): THREE.Scene {
  const scene = new THREE.Scene()

  const tex = makeGradientTexture()
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(40, 32, 24),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide }),
  )
  scene.add(shell)

  // warm softbox, upper-front-right — the key's reflection
  const warm = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 10),
    new THREE.MeshBasicMaterial({ color: '#FFE9CC', side: THREE.DoubleSide }),
  )
  warm.position.set(14, 12, 12)
  warm.lookAt(0, 0, 0)
  scene.add(warm)

  // cool softbox, lower-left — keeps the shade side alive in the reflection
  const cool = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 9),
    new THREE.MeshBasicMaterial({ color: '#BFD4EC', side: THREE.DoubleSide }),
  )
  cool.position.set(-15, -8, 8)
  cool.lookAt(0, 0, 0)
  scene.add(cool)

  return scene
}

/* Vertical gradient: warm above, neutral stage at the horizon band, cool-dark
   below. 2x256 is plenty for a smooth ramp the PMREM blurs anyway. */
function makeGradientTexture(): THREE.CanvasTexture {
  const w = 4
  const h = 256
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#3a3128') // warm dusk overhead
  g.addColorStop(0.42, '#6a5f50')
  g.addColorStop(0.52, '#a89478') // bright horizon band -> believable leather rim light
  g.addColorStop(0.62, '#5a5448')
  g.addColorStop(1, '#0c0d12') // cool stage underfoot
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.mapping = THREE.EquirectangularReflectionMapping
  return tex
}

export function Studio() {
  const gl = useThree((s) => s.gl)

  const envRT = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const scene = buildGradientScene()
    const rt = pmrem.fromScene(scene, 0.5)
    // free the scratch scene's geometries, materials, and the gradient texture
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        const mat = obj.material as THREE.MeshBasicMaterial
        mat.map?.dispose()
        mat.dispose()
      }
    })
    pmrem.dispose() // scratch generator — done baking
    return rt // keep the render target alive while the scene lights from it
  }, [gl])

  useEffect(() => () => envRT.dispose(), [envRT])

  return (
    <>
      <Environment map={envRT.texture} background={false} />
      {/* warm key: crisp specular roll-off, lower and more frontal so the pebble
          grain and the raised seam read with depth, not catalog-flat */}
      <directionalLight color="#FFF1DD" intensity={2.9} position={[2.6, 3.2, 5.2]} />
      {/* cool fill: low and to the left, lifts the shade side without flattening */}
      <directionalLight color="#C8DAF2" intensity={0.55} position={[-4.2, -1.4, 2.2]} />
      {/* tight rim: behind and low, raking across the seam to glint the waxed thread */}
      <directionalLight color="#FFFFFF" intensity={1.9} position={[-1.6, -2.2, -5.4]} />
    </>
  )
}
