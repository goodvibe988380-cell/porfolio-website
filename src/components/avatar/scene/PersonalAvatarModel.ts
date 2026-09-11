import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

export interface ModelLoadProgress {
  loaded: number
  total: number
}

export class PersonalAvatarModel {
  public group: THREE.Group
  public isLoaded = false

  // Cached Meshes & Morph Targets
  private facialMeshes: THREE.Mesh[] = []
  private morphMap: Map<string, { mesh: THREE.Mesh; index: number }[]> = new Map()

  // Cached Bones
  public bones: {
    hips?: THREE.Object3D
    spine?: THREE.Object3D
    spine1?: THREE.Object3D
    chest?: THREE.Object3D // Spine2
    neck?: THREE.Object3D
    head?: THREE.Object3D
    leftEye?: THREE.Object3D
    rightEye?: THREE.Object3D
    leftShoulder?: THREE.Object3D
    rightShoulder?: THREE.Object3D
    leftArm?: THREE.Object3D
    rightArm?: THREE.Object3D
    leftForeArm?: THREE.Object3D
    rightForeArm?: THREE.Object3D
    leftHand?: THREE.Object3D
    rightHand?: THREE.Object3D
    leftUpLeg?: THREE.Object3D
    rightUpLeg?: THREE.Object3D
    leftLeg?: THREE.Object3D
    rightLeg?: THREE.Object3D
    leftFoot?: THREE.Object3D
    rightFoot?: THREE.Object3D
  } = {}

  // Base transforms for natural relative motion
  private baseBoneRotations: Map<THREE.Object3D, THREE.Euler> = new Map()
  private baseBonePositions: Map<THREE.Object3D, THREE.Vector3> = new Map()

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'SanthoshAvatarGroup'
  }

  public async load(url = '/models/santhosh-digital-human.glb', onProgress?: (p: ModelLoadProgress) => void): Promise<void> {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)

    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene
          model.name = 'SanthoshDigitalHuman'

          // Center model on origin
          model.position.set(0, -0.92, 0)

          // Enable shadows and PBR tuning
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh
              mesh.castShadow = true
              mesh.receiveShadow = true

              // Morph targets cataloging
              if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                this.facialMeshes.push(mesh)
                for (const [name, index] of Object.entries(mesh.morphTargetDictionary)) {
                  if (!this.morphMap.has(name)) {
                    this.morphMap.set(name, [])
                  }
                  this.morphMap.get(name)!.push({ mesh, index })
                }
              }
            }

            // Bone & Node discovery (supports standard glTF, Mixamo, Ready Player Me, and our custom rig)
            const name = child.name.toLowerCase()
            if (name === 'hips' || name.endsWith('hips')) this.registerBone('hips', child)
            else if (name === 'spine' || name.endsWith('spine')) this.registerBone('spine', child)
            else if (name === 'spine1' || name.endsWith('spine1')) this.registerBone('spine1', child)
            else if (name === 'spine2' || name.includes('chest')) this.registerBone('chest', child)
            else if (name === 'neck' || name.endsWith('neck')) this.registerBone('neck', child)
            else if (name === 'head' || name.endsWith('head')) this.registerBone('head', child)
            else if (name.includes('lefteye') || (name.includes('eye') && name.includes('left'))) this.registerBone('leftEye', child)
            else if (name.includes('righteye') || (name.includes('eye') && name.includes('right'))) this.registerBone('rightEye', child)
            else if (name.includes('leftshoulder') || name.includes('shoulder.l')) this.registerBone('leftShoulder', child)
            else if (name.includes('rightshoulder') || name.includes('shoulder.r')) this.registerBone('rightShoulder', child)
            else if (name.includes('leftarm') || name.includes('arm.l') || name.includes('upperarm_l')) this.registerBone('leftArm', child)
            else if (name.includes('rightarm') || name.includes('arm.r') || name.includes('upperarm_r')) this.registerBone('rightArm', child)
            else if (name.includes('leftforearm') || name.includes('forearm_l')) this.registerBone('leftForeArm', child)
            else if (name.includes('rightforearm') || name.includes('forearm_r')) this.registerBone('rightForeArm', child)
            else if (name.includes('lefthand') || name.includes('hand_l')) this.registerBone('leftHand', child)
            else if (name.includes('righthand') || name.includes('hand_r')) this.registerBone('rightHand', child)
            else if (name.includes('leftupleg') || name.includes('thigh_l')) this.registerBone('leftUpLeg', child)
            else if (name.includes('rightupleg') || name.includes('thigh_r')) this.registerBone('rightUpLeg', child)
            else if (name.includes('leftleg') || name.includes('calf_l')) this.registerBone('leftLeg', child)
            else if (name.includes('rightleg') || name.includes('calf_r')) this.registerBone('rightLeg', child)
            else if (name.includes('leftfoot') || name.includes('foot_l')) this.registerBone('leftFoot', child)
            else if (name.includes('rightfoot') || name.includes('foot_r')) this.registerBone('rightFoot', child)
          })

          this.group.add(model)
          this.isLoaded = true

          console.log(
            `PersonalAvatarModel loaded successfully! Discovered ${this.morphMap.size} unique morph targets and ${Object.keys(this.bones).length} skeleton nodes.`
          )
          resolve()
        },
        (xhr) => {
          if (onProgress && xhr.total > 0) {
            onProgress({ loaded: xhr.loaded, total: xhr.total })
          }
        },
        (err) => {
          console.error('Error loading PersonalAvatarModel:', err)
          reject(err)
        }
      )
    })
  }

  private registerBone(key: keyof typeof this.bones, obj: THREE.Object3D) {
    if (!this.bones[key]) {
      this.bones[key] = obj
      this.baseBoneRotations.set(obj, obj.rotation.clone())
      this.baseBonePositions.set(obj, obj.position.clone())
    }
  }

  /**
   * Set facial morph target weight with automatic alias normalization
   * (maps standard names across ARKit, Oculus, ReadyPlayerMe)
   */
  public setMorphTarget(name: string, weight: number): void {
    const clampedWeight = Math.max(0, Math.min(1, weight))
    const aliases = this.getMorphAliases(name)

    for (const alias of aliases) {
      const targets = this.morphMap.get(alias)
      if (targets) {
        for (const { mesh, index } of targets) {
          if (mesh.morphTargetInfluences) {
            mesh.morphTargetInfluences[index] = clampedWeight
          }
        }
        return
      }
    }
  }

  public getMorphTarget(name: string): number {
    const aliases = this.getMorphAliases(name)
    for (const alias of aliases) {
      const targets = this.morphMap.get(alias)
      if (targets && targets[0]?.mesh.morphTargetInfluences) {
        return targets[0].mesh.morphTargetInfluences[targets[0].index] ?? 0
      }
    }
    return 0
  }

  public resetAllMorphTargets(): void {
    for (const targets of this.morphMap.values()) {
      for (const { mesh, index } of targets) {
        if (mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[index] = 0
        }
      }
    }
  }

  /**
   * Rotate a bone relative to its bind pose
   */
  public rotateBoneRelative(boneName: keyof typeof this.bones, rx: number, ry: number, rz: number): void {
    const bone = this.bones[boneName]
    if (!bone) return

    const baseRot = this.baseBoneRotations.get(bone)
    if (baseRot) {
      bone.rotation.x = baseRot.x + rx
      bone.rotation.y = baseRot.y + ry
      bone.rotation.z = baseRot.z + rz
    } else {
      bone.rotation.set(rx, ry, rz)
    }
  }

  /**
   * Translate a bone relative to its bind pose
   */
  public translateBoneRelative(boneName: keyof typeof this.bones, dx: number, dy: number, dz: number): void {
    const bone = this.bones[boneName]
    if (!bone) return

    const basePos = this.baseBonePositions.get(bone)
    if (basePos) {
      bone.position.x = basePos.x + dx
      bone.position.y = basePos.y + dy
      bone.position.z = basePos.z + dz
    }
  }

  private getMorphAliases(name: string): string[] {
    const map: Record<string, string[]> = {
      jawOpen: ['jawOpen', 'viseme_aa', 'viseme_AO', 'mouthOpen'],
      eyeBlinkLeft: ['eyeBlink_L', 'eyeBlinkLeft', 'blink_l', 'eye_blink_left'],
      eyeBlinkRight: ['eyeBlink_R', 'eyeBlinkRight', 'blink_r', 'eye_blink_right'],
      mouthSmileLeft: ['mouthSmile_L', 'mouthSmileLeft', 'smile_l'],
      mouthSmileRight: ['mouthSmile_R', 'mouthSmileRight', 'smile_r'],
      mouthFunnel: ['mouthFunnel', 'viseme_O', 'viseme_U', 'mouth_funnel'],
      mouthPucker: ['mouthPucker', 'viseme_UW', 'mouth_pucker'],
      mouthClose: ['mouthClose', 'viseme_PP', 'viseme_M', 'mouth_close'],
      browInnerUp: ['browInnerUp', 'brow_inner_up', 'brows_up'],
      browDownLeft: ['browDown_L', 'browDownLeft', 'brow_down_l'],
      browDownRight: ['browDown_R', 'browDownRight', 'brow_down_r'],
      eyeLookUpLeft: ['eyeLookUp_L', 'eyeLookUpLeft'],
      eyeLookUpRight: ['eyeLookUp_R', 'eyeLookUpRight'],
      eyeLookDownLeft: ['eyeLookDown_L', 'eyeLookDownLeft'],
      eyeLookDownRight: ['eyeLookDown_R', 'eyeLookDownRight'],
      eyeLookInLeft: ['eyeLookIn_L', 'eyeLookInLeft'],
      eyeLookInRight: ['eyeLookIn_R', 'eyeLookInRight'],
      eyeLookOutLeft: ['eyeLookOut_L', 'eyeLookOutLeft'],
      eyeLookOutRight: ['eyeLookOut_R', 'eyeLookOutRight'],
    }

    return map[name] || [name]
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.geometry?.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose())
        } else if (mesh.material) {
          mesh.material.dispose()
        }
      }
    })
    this.facialMeshes = []
    this.morphMap.clear()
    this.baseBoneRotations.clear()
    this.baseBonePositions.clear()
  }
}
