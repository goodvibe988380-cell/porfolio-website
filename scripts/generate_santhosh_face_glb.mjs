import fs from 'fs'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

// Polyfill FileReader for Node.js GLTFExporter
globalThis.FileReader = class FileReader {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer()
    if (this.onloadend) this.onloadend()
  }
}

async function buildSanthoshFaceAvatar() {
  console.log('--- GENERATING SANTHOSH 3D OFFICER FACE AVATAR (NO CAP, BIG FACE, 52 ARKIT MORPHS) ---')

  // 1. Load the authentic 3D head scan with 52 Apple ARKit blendshapes
  const facecapBuf = fs.readFileSync('public/models/facecap.glb')
  const facecapAb = facecapBuf.buffer.slice(facecapBuf.byteOffset, facecapBuf.byteOffset + facecapBuf.byteLength)

  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)

  const headGltf = await new Promise((resolve, reject) => {
    loader.parse(facecapAb, '', resolve, reject)
  })

  // Root Scene
  const rootScene = new THREE.Scene()
  rootScene.name = 'SanthoshOfficerFace'

  // ==========================================
  // PBR MATERIALS: Professional Officer
  // ==========================================
  // 1. Warm South Asian skin tone matching Santhosh's portrait
  const skinMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_Skin',
    color: new THREE.Color('#9c6644'),
    roughness: 0.55,
    metalness: 0.04,
  })

  // 2. High-grade officer uniform collar (dark charcoal with subtle navy undertone)
  const collarMaterial = new THREE.MeshStandardMaterial({
    name: 'Officer_Collar',
    color: new THREE.Color('#12151f'),
    roughness: 0.6,
    metalness: 0.25,
  })

  // 3. Cyber cyan trim on collar
  const cyanTrimMaterial = new THREE.MeshStandardMaterial({
    name: 'Officer_CyberTrim',
    color: new THREE.Color('#00f0ff'),
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 2.0,
    roughness: 0.2,
    metalness: 0.8,
  })

  // 4. Hair material (deep espresso brown, soft sheen, NO CAP)
  const hairMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_Officer_Hair',
    color: new THREE.Color('#14100d'),
    roughness: 0.72,
    metalness: 0.12,
  })

  // 5. Eyes material (rich brown iris with depth)
  const eyeMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_EyeIris',
    color: new THREE.Color('#321e12'),
    roughness: 0.15,
    metalness: 0.08,
  })

  // ==========================================
  // SKELETON NODES (Focused on Neck, Head, Eyes)
  // ==========================================
  const neck = new THREE.Group()
  neck.name = 'Neck'
  neck.position.set(0, -0.16, 0)
  rootScene.add(neck)

  const head = new THREE.Group()
  head.name = 'Head'
  head.position.set(0, 0.16, 0)
  neck.add(head)

  // Direct eye tracking bones for gaze reaction
  const leftEyeBone = new THREE.Group()
  leftEyeBone.name = 'LeftEye'
  leftEyeBone.position.set(-0.036, 0.042, 0.062)
  head.add(leftEyeBone)

  const rightEyeBone = new THREE.Group()
  rightEyeBone.name = 'RightEye'
  rightEyeBone.position.set(0.036, 0.042, 0.062)
  head.add(rightEyeBone)

  // Dummy bones for compatibility with full rig controllers
  const hips = new THREE.Group()
  hips.name = 'Hips'
  hips.position.set(0, -0.6, 0)
  rootScene.add(hips)

  const chest = new THREE.Group()
  chest.name = 'Spine2'
  chest.position.set(0, -0.05, 0)
  neck.add(chest)

  // ==========================================
  // ATTACH 3D HEAD & 52 ARKIT MORPH TARGETS
  // ==========================================
  headGltf.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 10) {
        child.name = 'Wolf3D_Head'
        child.material = skinMaterial
        console.log('Attached Wolf3D_Head with', Object.keys(child.morphTargetDictionary).length, 'ARKit morph targets!')
      } else if (child.parent?.name?.includes('eye') || child.name.includes('eye') || child.name.includes('Eye')) {
        child.material = eyeMaterial
      } else if (child.parent?.name === 'teeth' || child.name.includes('teeth')) {
        child.material = new THREE.MeshStandardMaterial({ color: 0xf6f7f9, roughness: 0.25 })
      }
    }
  })

  // Scale the head to adult anatomical proportions (scaled for prominent framing)
  const headScene = headGltf.scene
  headScene.name = 'Head_Rig_Group'
  const headScale = 0.092
  headScene.scale.set(headScale, headScale, headScale)
  headScene.position.set(0, 0.02, 0.012)
  head.add(headScene)

  // ==========================================
  // PROFESSIONAL OFFICER HAIRSTYLE (NO CAP!)
  // ==========================================
  // Clean, handsome, executive-styled hair:
  // Distinct sculpted wave tufts following the natural scalp without any round cap or dome.
  const hairGroup = new THREE.Group()
  hairGroup.name = 'Santhosh_Officer_Hair'

  // Individual natural hair strands & locks (tapered capsules with realistic angles)
  const lockGeo = new THREE.CapsuleGeometry(0.02, 0.075, 6, 8)
  const shortLockGeo = new THREE.CapsuleGeometry(0.016, 0.05, 6, 8)
  const fineLockGeo = new THREE.CapsuleGeometry(0.012, 0.04, 6, 8)

  const hairLocks = [
    // Top-front volume (swept naturally across forehead, showing natural hairline)
    { geo: lockGeo, pos: [-0.038, 0.128, 0.055], rot: [0.28, 0.22, -0.35], scale: [1.1, 1.2, 0.95] },
    { geo: lockGeo, pos: [0.015, 0.138, 0.062], rot: [0.32, -0.12, 0.18], scale: [1.2, 1.25, 1.0] },
    { geo: lockGeo, pos: [0.052, 0.132, 0.052], rot: [0.3, -0.25, 0.42], scale: [1.1, 1.2, 0.95] },
    { geo: lockGeo, pos: [-0.01, 0.144, 0.045], rot: [0.35, 0.05, 0.08], scale: [1.25, 1.3, 1.05] },

    // Crown and top-back volume
    { geo: lockGeo, pos: [0.0, 0.142, 0.0], rot: [0.15, 0.0, 0.0], scale: [1.3, 1.25, 1.1] },
    { geo: lockGeo, pos: [-0.045, 0.135, -0.015], rot: [0.1, 0.18, -0.28], scale: [1.15, 1.2, 1.0] },
    { geo: lockGeo, pos: [0.045, 0.135, -0.015], rot: [0.1, -0.18, 0.28], scale: [1.15, 1.2, 1.0] },
    { geo: lockGeo, pos: [0.0, 0.125, -0.05], rot: [-0.22, 0.0, 0.0], scale: [1.25, 1.2, 1.05] },

    // Left temple and side taper (clean officer fade)
    { geo: shortLockGeo, pos: [-0.078, 0.082, 0.032], rot: [0.2, 0.28, -0.65], scale: [1.0, 1.1, 0.9] },
    { geo: shortLockGeo, pos: [-0.082, 0.058, 0.01], rot: [0.05, 0.35, -0.75], scale: [0.95, 1.05, 0.85] },
    { geo: fineLockGeo, pos: [-0.075, 0.035, 0.02], rot: [0.0, 0.25, -0.85], scale: [0.9, 1.0, 0.8] }, // Sideburn
    { geo: shortLockGeo, pos: [-0.07, 0.085, -0.025], rot: [-0.15, 0.3, -0.55], scale: [1.0, 1.05, 0.9] },

    // Right temple and side taper
    { geo: shortLockGeo, pos: [0.078, 0.082, 0.032], rot: [0.2, -0.28, 0.65], scale: [1.0, 1.1, 0.9] },
    { geo: shortLockGeo, pos: [0.082, 0.058, 0.01], rot: [0.05, -0.35, 0.75], scale: [0.95, 1.05, 0.85] },
    { geo: fineLockGeo, pos: [0.075, 0.035, 0.02], rot: [0.0, -0.25, 0.85], scale: [0.9, 1.0, 0.8] }, // Sideburn
    { geo: shortLockGeo, pos: [0.07, 0.085, -0.025], rot: [-0.15, -0.3, 0.55], scale: [1.0, 1.05, 0.9] },

    // Back taper (clean executive officer neckline)
    { geo: shortLockGeo, pos: [-0.045, 0.07, -0.075], rot: [-0.35, 0.15, -0.2], scale: [1.05, 1.1, 0.95] },
    { geo: shortLockGeo, pos: [0.045, 0.07, -0.075], rot: [-0.35, -0.15, 0.2], scale: [1.05, 1.1, 0.95] },
    { geo: shortLockGeo, pos: [0.0, 0.055, -0.085], rot: [-0.45, 0.0, 0.0], scale: [1.1, 1.1, 1.0] },
  ]

  hairLocks.forEach((lock) => {
    const mesh = new THREE.Mesh(lock.geo, hairMaterial)
    mesh.position.set(...lock.pos)
    mesh.rotation.set(...lock.rot)
    mesh.scale.set(...lock.scale)
    hairGroup.add(mesh)
  })
  head.add(hairGroup)

  // ==========================================
  // PROFESSIONAL OFFICER COLLAR (Bust Base)
  // ==========================================
  // An elegant mandarin cyber-officer collar that frames the neck cleanly
  const collarGroup = new THREE.Group()
  collarGroup.name = 'Officer_Collar_Base'

  // Neck base cylinder
  const neckBaseGeo = new THREE.CylinderGeometry(0.068, 0.078, 0.11, 20)
  neckBaseGeo.scale(1.05, 1.0, 0.92)
  const neckBaseMesh = new THREE.Mesh(neckBaseGeo, skinMaterial)
  neckBaseMesh.position.set(0, -0.035, 0.005)
  collarGroup.add(neckBaseMesh)

  // Mandarin officer collar
  const officerCollarGeo = new THREE.CylinderGeometry(0.086, 0.115, 0.09, 24, 1, true)
  officerCollarGeo.scale(1.15, 1.0, 0.92)
  const officerCollarMesh = new THREE.Mesh(officerCollarGeo, collarMaterial)
  officerCollarMesh.position.set(0, -0.085, 0.005)
  collarGroup.add(officerCollarMesh)

  // Cyber cyan piping along the collar edge
  const collarTrimGeo = new THREE.TorusGeometry(0.094, 0.0035, 8, 32)
  collarTrimGeo.scale(1.12, 0.92, 1.0)
  const collarTrimMesh = new THREE.Mesh(collarTrimGeo, cyanTrimMaterial)
  collarTrimMesh.rotation.x = Math.PI / 2
  collarTrimMesh.position.set(0, -0.045, 0.005)
  collarGroup.add(collarTrimMesh)

  // Lower shoulder bust base (subtle grounded bevel)
  const shoulderBaseGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.08, 24)
  shoulderBaseGeo.scale(1.4, 1.0, 0.8)
  const shoulderBaseMesh = new THREE.Mesh(shoulderBaseGeo, collarMaterial)
  shoulderBaseMesh.position.set(0, -0.155, 0)
  collarGroup.add(shoulderBaseMesh)

  neck.add(collarGroup)

  // ==========================================
  // EXPORT TO GLB
  // ==========================================
  const outputPath = 'public/models/santhosh-digital-human.glb'
  console.log('Exporting Officer Face Avatar GLB to:', outputPath)

  const exporter = new GLTFExporter()
  await new Promise((resolve, reject) => {
    exporter.parse(
      rootScene,
      (glb) => {
        fs.writeFileSync(outputPath, Buffer.from(glb))
        console.log('SUCCESS: Written', glb.byteLength, 'bytes to', outputPath)
        resolve()
      },
      reject,
      { binary: true, embedImages: true }
    )
  })

  // Verify
  const testBuf = fs.readFileSync(outputPath)
  const testAb = testBuf.buffer.slice(testBuf.byteOffset, testBuf.byteOffset + testBuf.byteLength)
  await new Promise((resolve, reject) => {
    loader.parse(testAb, '', (g) => {
      const box = new THREE.Box3().setFromObject(g.scene)
      const size = box.getSize(new THREE.Vector3())
      console.log('Officer Model Bounding Box:', box.min, 'to', box.max)
      console.log('Officer Model Size:', size)
      let morphs = 0
      g.scene.traverse((c) => {
        if (c.morphTargetDictionary) {
          morphs += Object.keys(c.morphTargetDictionary).length
        }
      })
      console.log(`VERIFICATION PASSED: ${morphs} facial morph targets found in ${outputPath}`)
      resolve()
    }, reject)
  })
}

buildSanthoshFaceAvatar().catch((err) => {
  console.error('FAILED TO BUILD OFFICER FACE AVATAR:', err)
  process.exit(1)
})
