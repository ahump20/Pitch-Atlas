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
  contract intact. drei's <Environment map> applies it to the scene and disposes
  cleanly; the generated texture is freed on unmount.
*/
export function Studio() {
  const gl = useThree((s) => s.gl)

  const envMap = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const rt = pmrem.fromScene(new RoomEnvironment(), 0.04)
    pmrem.dispose()
    return rt.texture
  }, [gl])

  useEffect(() => () => envMap.dispose(), [envMap])

  return (
    <>
      <Environment map={envMap} background={false} />
      <directionalLight color="#fff4e2" intensity={2.5} position={[3, 4.5, 4]} />
      <directionalLight color="#cfe0ff" intensity={0.5} position={[-4, -1, 2]} />
      <directionalLight color="#ffffff" intensity={1.1} position={[-2, 3, -5]} />
    </>
  )
}
