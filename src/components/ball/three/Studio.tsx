import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/*
  The studio rig that makes the leather read as leather: a RoomEnvironment baked
  to a PMREM cube the scene reflects, plus a warm key, a cool fill, and a white
  rim behind. The environment is generated once from the local RoomEnvironment —
  no CDN HDRI, no runtime asset fetch, which keeps the no-external-call honesty
  contract intact.

  PMREM lifecycle (order matters): the RoomEnvironment and the PMREMGenerator are
  scratch — they only bake the cube, so both are disposed the moment generation
  finishes. The generated render target, though, must stay alive the whole time
  the scene reflects its texture; freeing it early would invalidate the very map
  the lighting reads from. So we hold the render target (not just its texture) and
  dispose it on unmount — after drei's <Environment> has already restored
  scene.environment (its layout-effect cleanup runs child-before-parent). One
  rt.dispose() releases the texture and the framebuffers together.
*/
export function Studio() {
  const gl = useThree((s) => s.gl)

  const envRT = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const rt = pmrem.fromScene(room, 0.04)
    room.dispose() // scratch source scene — free its geometries/materials
    pmrem.dispose() // scratch generator — done baking
    return rt // keep the render target alive while the scene lights from it
  }, [gl])

  useEffect(() => () => envRT.dispose(), [envRT])

  return (
    <>
      <Environment map={envRT.texture} background={false} />
      <directionalLight color="#fff4e2" intensity={2.5} position={[3, 4.5, 4]} />
      <directionalLight color="#cfe0ff" intensity={0.5} position={[-4, -1, 2]} />
      <directionalLight color="#ffffff" intensity={1.1} position={[-2, 3, -5]} />
    </>
  )
}
