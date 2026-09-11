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

async function buildSanthoshAvatar() {
  console.log('--- GENERATING SANTHOSH 3D DIGITAL HUMAN MODEL ---')

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
  rootScene.name = 'SanthoshDigitalHuman'

  // Materials matching reference photo:
  // 1. South Asian warm skin tone
  const skinMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_Skin',
    color: new THREE.Color('#946343'),
    roughness: 0.58,
    metalness: 0.05,
  })

  // 2. Deep matte tech jacket
  const jacketMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_TechJacket',
    color: new THREE.Color('#141720'),
    roughness: 0.65,
    metalness: 0.2,
  })

  // 3. Cyber cyan glowing piping (exact lapel seam lines from reference photo)
  const cyberPipingMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_CyberCyan',
    color: new THREE.Color('#00f0ff'),
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 2.2,
    roughness: 0.2,
    metalness: 0.8,
  })

  // 4. Inner t-shirt
  const shirtMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_Shirt',
    color: new THREE.Color('#0b0c10'),
    roughness: 0.8,
    metalness: 0.05,
  })

  // 5. Cargo pants
  const pantsMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_CargoPants',
    color: new THREE.Color('#161922'),
    roughness: 0.75,
    metalness: 0.1,
  })

  // 6. Futuristic sneakers
  const sneakerWhiteMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_Sneakers_White',
    color: new THREE.Color('#f0f4f8'),
    roughness: 0.4,
    metalness: 0.15,
  })
  const sneakerCyanMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_Sneakers_Cyan',
    color: new THREE.Color('#00d4ff'),
    emissive: new THREE.Color('#00d4ff'),
    emissiveIntensity: 1.4,
    roughness: 0.3,
  })

  // 7. Hair material (dark wavy textured hair)
  const hairMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_Hair',
    color: new THREE.Color('#181412'),
    roughness: 0.85,
    metalness: 0.1,
  })

  // 8. Eyes & Cornea
  const eyeMaterial = new THREE.MeshStandardMaterial({
    name: 'Santhosh_EyeIris',
    color: new THREE.Color('#382215'),
    roughness: 0.2,
    metalness: 0.1,
  })

  // ==========================================
  // SKELETON HIERARCHY
  // ==========================================
  const hips = new THREE.Group()
  hips.name = 'Hips'
  hips.position.set(0, 0.96, 0)
  rootScene.add(hips)

  const spine = new THREE.Group()
  spine.name = 'Spine'
  spine.position.set(0, 0.12, 0)
  hips.add(spine)

  const spine1 = new THREE.Group()
  spine1.name = 'Spine1'
  spine1.position.set(0, 0.14, 0)
  spine.add(spine1)

  const chest = new THREE.Group()
  chest.name = 'Spine2'
  chest.position.set(0, 0.15, 0)
  spine1.add(chest)

  const neck = new THREE.Group()
  neck.name = 'Neck'
  neck.position.set(0, 0.18, 0)
  chest.add(neck)

  const head = new THREE.Group()
  head.name = 'Head'
  head.position.set(0, 0.12, 0)
  neck.add(head)

  // Eyes (direct gaze tracking bones)
  const leftEyeBone = new THREE.Group()
  leftEyeBone.name = 'LeftEye'
  leftEyeBone.position.set(-0.035, 0.045, 0.065)
  head.add(leftEyeBone)

  const rightEyeBone = new THREE.Group()
  rightEyeBone.name = 'RightEye'
  rightEyeBone.position.set(0.035, 0.045, 0.065)
  head.add(rightEyeBone)

  // Shoulders & Arms
  const leftShoulder = new THREE.Group()
  leftShoulder.name = 'LeftShoulder'
  leftShoulder.position.set(0.14, 0.10, -0.01)
  chest.add(leftShoulder)

  const leftArm = new THREE.Group()
  leftArm.name = 'LeftArm'
  leftArm.position.set(0.12, -0.02, 0)
  leftShoulder.add(leftArm)

  const leftForeArm = new THREE.Group()
  leftForeArm.name = 'LeftForeArm'
  leftForeArm.position.set(0.02, -0.26, 0.02)
  leftArm.add(leftForeArm)

  const leftHand = new THREE.Group()
  leftHand.name = 'LeftHand'
  leftHand.position.set(0.02, -0.22, 0.04)
  leftForeArm.add(leftHand)

  const rightShoulder = new THREE.Group()
  rightShoulder.name = 'RightShoulder'
  rightShoulder.position.set(-0.14, 0.10, -0.01)
  chest.add(rightShoulder)

  const rightArm = new THREE.Group()
  rightArm.name = 'RightArm'
  rightArm.position.set(-0.12, -0.02, 0)
  rightShoulder.add(rightArm)

  const rightForeArm = new THREE.Group()
  rightForeArm.name = 'RightForeArm'
  rightForeArm.position.set(-0.02, -0.26, 0.02)
  rightArm.add(rightForeArm)

  const rightHand = new THREE.Group()
  rightHand.name = 'RightHand'
  rightHand.position.set(-0.02, -0.22, 0.04)
  rightForeArm.add(rightHand)

  // Legs
  const leftUpLeg = new THREE.Group()
  leftUpLeg.name = 'LeftUpLeg'
  leftUpLeg.position.set(0.10, -0.04, 0.02)
  hips.add(leftUpLeg)

  const leftLeg = new THREE.Group()
  leftLeg.name = 'LeftLeg'
  leftLeg.position.set(0.01, -0.42, -0.01)
  leftUpLeg.add(leftLeg)

  const leftFoot = new THREE.Group()
  leftFoot.name = 'LeftFoot'
  leftFoot.position.set(0, -0.42, 0.04)
  leftLeg.add(leftFoot)

  const rightUpLeg = new THREE.Group()
  rightUpLeg.name = 'RightUpLeg'
  rightUpLeg.position.set(-0.10, -0.04, -0.02)
  hips.add(rightUpLeg)

  const rightLeg = new THREE.Group()
  rightLeg.name = 'RightLeg'
  rightLeg.position.set(-0.01, -0.42, 0.01)
  rightUpLeg.add(rightLeg)

  const rightFoot = new THREE.Group()
  rightFoot.name = 'RightFoot'
  rightFoot.position.set(0, -0.42, 0.04)
  rightLeg.add(rightFoot)

  // ==========================================
  // ATTACH 3D HEAD MESH & ARKIT MORPH TARGETS
  // ==========================================
  headGltf.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 10) {
        child.name = 'Wolf3D_Head'
        child.material = skinMaterial
        console.log('Found Wolf3D_Head with', Object.keys(child.morphTargetDictionary).length, 'ARKit morph targets!')
      } else if (child.parent?.name?.includes('eye') || child.name.includes('eye') || child.name.includes('Eye')) {
        child.material = eyeMaterial
      } else if (child.parent?.name === 'teeth' || child.name.includes('teeth')) {
        child.material = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.3 })
      }
    }
  })

  // Scale the entire head scene so it matches anatomical human proportions (18cm wide, 26cm tall)
  const headScene = headGltf.scene
  headScene.name = 'Head_Rig_Group'
  const headScale = 0.08
  headScene.scale.set(headScale, headScale, headScale)
  headScene.position.set(0, 0.02, 0.01)
  head.add(headScene)

  // ==========================================
  // WAVY TEXTURED HAIR (Santhosh Style)
  // ==========================================
  const hairGroup = new THREE.Group()
  hairGroup.name = 'Santhosh_Hair_Volume'
  const hairBaseGeo = new THREE.SphereGeometry(0.112, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.55)
  hairBaseGeo.scale(0.98, 1.05, 1.10)
  const hairBaseMesh = new THREE.Mesh(hairBaseGeo, hairMaterial)
  hairBaseMesh.position.set(0, 0.055, -0.012)
  hairGroup.add(hairBaseMesh)

  // Volumetric wave tufts matching Santhosh's iconic wavy haircut
  const tuftGeo = new THREE.CapsuleGeometry(0.022, 0.055, 6, 8)
  const tuftPositions = [
    { pos: [-0.042, 0.115, 0.035], rot: [0.3, 0.2, -0.4], scale: [1.1, 1.2, 0.9] },
    { pos: [0.032, 0.125, 0.045], rot: [0.25, -0.15, 0.3], scale: [1.15, 1.25, 0.95] },
    { pos: [0.0, 0.135, 0.028], rot: [0.4, 0.0, 0.1], scale: [1.3, 1.3, 1.1] },
    { pos: [-0.08, 0.075, 0.01], rot: [0.1, 0.3, -0.6], scale: [1.0, 1.1, 0.9] },
    { pos: [0.08, 0.075, 0.01], rot: [0.1, -0.3, 0.6], scale: [1.0, 1.1, 0.9] },
    { pos: [-0.055, 0.085, -0.038], rot: [-0.2, 0.3, -0.5], scale: [1.05, 1.15, 0.95] },
    { pos: [0.055, 0.085, -0.038], rot: [-0.2, -0.3, 0.5], scale: [1.05, 1.15, 0.95] },
    { pos: [0.0, 0.065, -0.075], rot: [-0.4, 0.0, 0.0], scale: [1.2, 1.2, 1.0] },
  ]
  tuftPositions.forEach((tp) => {
    const tuft = new THREE.Mesh(tuftGeo, hairMaterial)
    tuft.position.set(...tp.pos)
    tuft.rotation.set(...tp.rot)
    tuft.scale.set(...tp.scale)
    hairGroup.add(tuft)
  })
  head.add(hairGroup)

  // ==========================================
  // TORSO & CYBER JACKET (Santhosh Tech Suit)
  // ==========================================
  // Inner t-shirt
  const shirtGeo = new THREE.CylinderGeometry(0.14, 0.155, 0.28, 16)
  shirtGeo.scale(1.15, 1.0, 0.85)
  const shirtMesh = new THREE.Mesh(shirtGeo, shirtMaterial)
  shirtMesh.position.set(0, -0.08, 0.01)
  chest.add(shirtMesh)

  // Outer tech jacket
  const jacketGeo = new THREE.CylinderGeometry(0.165, 0.18, 0.36, 18)
  jacketGeo.scale(1.22, 1.0, 0.92)
  const jacketMesh = new THREE.Mesh(jacketGeo, jacketMaterial)
  jacketMesh.position.set(0, -0.11, 0.0)
  chest.add(jacketMesh)

  // Cyber cyan glowing lapel piping (Left & Right)
  const pipingCurveLeft = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.04, 0.12, 0.125),
    new THREE.Vector3(0.09, 0.04, 0.13),
    new THREE.Vector3(0.11, -0.08, 0.12),
    new THREE.Vector3(0.08, -0.24, 0.11),
  ])
  const pipingLeftGeo = new THREE.TubeGeometry(pipingCurveLeft, 16, 0.0045, 8, false)
  const pipingLeftMesh = new THREE.Mesh(pipingLeftGeo, cyberPipingMaterial)
  chest.add(pipingLeftMesh)

  const pipingCurveRight = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.04, 0.12, 0.125),
    new THREE.Vector3(-0.09, 0.04, 0.13),
    new THREE.Vector3(-0.11, -0.08, 0.12),
    new THREE.Vector3(-0.08, -0.24, 0.11),
  ])
  const pipingRightGeo = new THREE.TubeGeometry(pipingCurveRight, 16, 0.0045, 8, false)
  const pipingRightMesh = new THREE.Mesh(pipingRightGeo, cyberPipingMaterial)
  chest.add(pipingRightMesh)

  // Lower jacket on spine
  const lowerJacketGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.22, 16)
  lowerJacketGeo.scale(1.2, 1.0, 0.9)
  const lowerJacketMesh = new THREE.Mesh(lowerJacketGeo, jacketMaterial)
  lowerJacketMesh.position.set(0, -0.04, 0)
  spine1.add(lowerJacketMesh)

  // ==========================================
  // ARMS & SLEEVES
  // ==========================================
  // Left Arm Upper
  const leftArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.26, 12)
  const leftArmMesh = new THREE.Mesh(leftArmGeo, jacketMaterial)
  leftArmMesh.position.set(0, -0.13, 0)
  leftArm.add(leftArmMesh)

  // Left Forearm
  const leftForeArmGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.24, 12)
  const leftForeArmMesh = new THREE.Mesh(leftForeArmGeo, jacketMaterial)
  leftForeArmMesh.position.set(0, -0.12, 0)
  leftForeArm.add(leftForeArmMesh)

  // Left Hand (skin)
  const handGeo = new THREE.BoxGeometry(0.045, 0.085, 0.03)
  const leftHandMesh = new THREE.Mesh(handGeo, skinMaterial)
  leftHandMesh.position.set(0, -0.04, 0)
  leftHand.add(leftHandMesh)

  // Right Arm Upper
  const rightArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.26, 12)
  const rightArmMesh = new THREE.Mesh(rightArmGeo, jacketMaterial)
  rightArmMesh.position.set(0, -0.13, 0)
  rightArm.add(rightArmMesh)

  // Right Forearm
  const rightForeArmGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.24, 12)
  const rightForeArmMesh = new THREE.Mesh(rightForeArmGeo, jacketMaterial)
  rightForeArmMesh.position.set(0, -0.12, 0)
  rightForeArm.add(rightForeArmMesh)

  // Right Hand (skin)
  const rightHandMesh = new THREE.Mesh(handGeo, skinMaterial)
  rightHandMesh.position.set(0, -0.04, 0)
  rightHand.add(rightHandMesh)

  // ==========================================
  // LEGS & CARGO PANTS
  // ==========================================
  // Left Thigh
  const thighGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.42, 14)
  const leftThighMesh = new THREE.Mesh(thighGeo, pantsMaterial)
  leftThighMesh.position.set(0, -0.21, 0)
  leftUpLeg.add(leftThighMesh)

  // Left Cargo Pocket
  const pocketGeo = new THREE.BoxGeometry(0.035, 0.12, 0.09)
  const leftPocketMesh = new THREE.Mesh(pocketGeo, pantsMaterial)
  leftPocketMesh.position.set(0.065, -0.22, 0.02)
  leftUpLeg.add(leftPocketMesh)

  // Left Calf
  const calfGeo = new THREE.CylinderGeometry(0.062, 0.052, 0.42, 14)
  const leftCalfMesh = new THREE.Mesh(calfGeo, pantsMaterial)
  leftCalfMesh.position.set(0, -0.21, 0)
  leftLeg.add(leftCalfMesh)

  // Left Sneaker
  const sneakerGroupLeft = new THREE.Group()
  const sneakerSoleGeo = new THREE.BoxGeometry(0.08, 0.035, 0.22)
  const sneakerSoleMesh = new THREE.Mesh(sneakerSoleGeo, sneakerWhiteMaterial)
  sneakerSoleMesh.position.set(0, -0.04, 0.05)
  sneakerGroupLeft.add(sneakerSoleMesh)

  const sneakerUpperGeo = new THREE.BoxGeometry(0.076, 0.055, 0.18)
  const sneakerUpperMesh = new THREE.Mesh(sneakerUpperGeo, sneakerWhiteMaterial)
  sneakerUpperMesh.position.set(0, -0.015, 0.04)
  sneakerGroupLeft.add(sneakerUpperMesh)

  const sneakerStripeGeo = new THREE.BoxGeometry(0.082, 0.015, 0.08)
  const sneakerStripeMesh = new THREE.Mesh(sneakerStripeGeo, sneakerCyanMaterial)
  sneakerStripeMesh.position.set(0, -0.01, 0.04)
  sneakerGroupLeft.add(sneakerStripeMesh)
  leftFoot.add(sneakerGroupLeft)

  // Right Thigh
  const rightThighMesh = new THREE.Mesh(thighGeo, pantsMaterial)
  rightThighMesh.position.set(0, -0.21, 0)
  rightUpLeg.add(rightThighMesh)

  // Right Cargo Pocket
  const rightPocketMesh = new THREE.Mesh(pocketGeo, pantsMaterial)
  rightPocketMesh.position.set(-0.065, -0.22, 0.02)
  rightUpLeg.add(rightPocketMesh)

  // Right Calf
  const rightCalfMesh = new THREE.Mesh(calfGeo, pantsMaterial)
  rightCalfMesh.position.set(0, -0.21, 0)
  rightLeg.add(rightCalfMesh)

  // Right Sneaker
  const sneakerGroupRight = new THREE.Group()
  const sneakerSoleRight = new THREE.Mesh(sneakerSoleGeo, sneakerWhiteMaterial)
  sneakerSoleRight.position.set(0, -0.04, 0.05)
  sneakerGroupRight.add(sneakerSoleRight)

  const sneakerUpperRight = new THREE.Mesh(sneakerUpperGeo, sneakerWhiteMaterial)
  sneakerUpperRight.position.set(0, -0.015, 0.04)
  sneakerGroupRight.add(sneakerUpperRight)

  const sneakerStripeRight = new THREE.Mesh(sneakerStripeGeo, sneakerCyanMaterial)
  sneakerStripeRight.position.set(0, -0.01, 0.04)
  sneakerGroupRight.add(sneakerStripeRight)
  rightFoot.add(sneakerGroupRight)

  // ==========================================
  // EXPORT TO GLB
  // ==========================================
  const outputPath = 'public/models/santhosh-digital-human.glb'
  console.log('Exporting GLB scene to:', outputPath)

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

  // Verify the newly generated GLB
  const testBuf = fs.readFileSync(outputPath)
  const testAb = testBuf.buffer.slice(testBuf.byteOffset, testBuf.byteOffset + testBuf.byteLength)
  await new Promise((resolve, reject) => {
    loader.parse(testAb, '', (g) => {
      let bones = 0
      let morphs = 0
      g.scene.traverse((c) => {
        if (c.name.includes('Spine') || c.name.includes('Head') || c.name.includes('Hips') || c.name.includes('Arm') || c.name.includes('Leg') || c.name.includes('Eye')) {
          bones++
        }
        if (c.morphTargetDictionary) {
          morphs += Object.keys(c.morphTargetDictionary).length
        }
      })
      console.log(`VERIFICATION PASSED: ${bones} skeleton nodes, ${morphs} facial morph targets found in ${outputPath}`)
      resolve()
    }, reject)
  })
}

buildSanthoshAvatar().catch((err) => {
  console.error('FAILED TO BUILD AVATAR:', err)
  process.exit(1)
})
