import { PersonalAvatarModel } from './PersonalAvatarModel'
import { LipSyncController } from './LipSyncController'

export type AvatarState = 'IDLE' | 'AWARE' | 'CURIOUS' | 'ENGAGED' | 'THINKING' | 'SPEAKING' | 'RESPONDING' | 'ACTIVE'

export interface PointerTarget {
  x: number // -1 to 1
  y: number // -1 to 1
  isInside: boolean
  isTouch: boolean
}

export class AvatarController {
  private currentState: AvatarState = 'IDLE'
  private stateTime = 0

  // Hierarchical gaze targets (smoothed)
  public smoothedPointer = { x: 0, y: 0 }
  public targetPointer = { x: 0, y: 0 }
  public isUserInteracting = false

  // Biological breathing
  private breathingPhase = 0
  private breathingRate = 1.35 // ~13-14 breaths per minute

  // Randomized involuntary blinking
  private nextBlinkTime = 3.2
  private blinkTimer = 0
  private isBlinking = false
  private blinkProgress = 0 // 0 = open, 1 = closed
  private isDoubleBlink = false

  // Micro-saccadic eye movement
  private saccadeTimer = 0
  private nextSaccadeTime = 1.8
  private saccadeOffsetX = 0
  private saccadeOffsetY = 0

  // Gestures & Nodding
  private isNodding = false
  private nodProgress = 0

  // Touch pulse & acknowledgment
  private touchPulseProgress = 0
  private isTouchPulsing = false

  // Energy & Expression levels
  private energyLevel = 1.0

  // Callback
  private onStateChange?: (state: AvatarState) => void

  constructor(onStateChange?: (state: AvatarState) => void) {
    this.onStateChange = onStateChange
  }

  public setState(state: AvatarState): void {
    if (this.currentState === state) return
    this.currentState = state
    this.stateTime = 0

    switch (state) {
      case 'IDLE':
        this.energyLevel = 0.9
        break
      case 'AWARE':
        this.energyLevel = 1.15
        break
      case 'CURIOUS':
        this.energyLevel = 1.35
        break
      case 'ENGAGED':
        this.energyLevel = 1.6
        this.triggerPulse()
        break
      case 'THINKING':
        this.energyLevel = 1.3
        break
      case 'SPEAKING':
        this.energyLevel = 1.7
        break
      case 'RESPONDING':
        this.energyLevel = 1.75
        this.triggerNod()
        this.triggerPulse()
        break
      case 'ACTIVE':
        this.energyLevel = 1.85
        this.triggerPulse()
        break
    }

    if (this.onStateChange) {
      this.onStateChange(state)
    }
  }

  public getState(): AvatarState {
    return this.currentState
  }

  public getEnergyLevel(): number {
    return this.energyLevel
  }

  public getPulse(): number {
    return this.isTouchPulsing ? Math.sin(this.touchPulseProgress * Math.PI) : 0
  }

  public setPointer(x: number, y: number, isInside: boolean, isTouch: boolean): void {
    this.targetPointer.x = x
    this.targetPointer.y = y
    this.isUserInteracting = isInside

    if (isInside && this.currentState === 'IDLE') {
      this.setState('AWARE')
    } else if (!isInside && this.currentState === 'AWARE' && !isTouch) {
      this.setState('IDLE')
    }
  }

  public triggerPulse(): void {
    this.isTouchPulsing = true
    this.touchPulseProgress = 0
  }

  public triggerNod(): void {
    this.isNodding = true
    this.nodProgress = 0
  }

  public update(delta: number, model: PersonalAvatarModel, lipSync: LipSyncController): void {
    if (!model.isLoaded) return

    this.stateTime += delta

    // 1. Damped pointer smoothing (spring damping)
    const lerpRate = this.isUserInteracting ? Math.min(1, delta * 9) : Math.min(1, delta * 4)
    this.smoothedPointer.x += (this.targetPointer.x - this.smoothedPointer.x) * lerpRate
    this.smoothedPointer.y += (this.targetPointer.y - this.smoothedPointer.y) * lerpRate

    // 2. Biological breathing
    this.breathingPhase += delta * this.breathingRate
    const breathSin = Math.sin(this.breathingPhase)

    // 3. Micro-saccadic eye movement (alive biological micro-movements)
    this.saccadeTimer += delta
    if (this.saccadeTimer >= this.nextSaccadeTime) {
      this.saccadeTimer = 0
      this.nextSaccadeTime = 1.2 + Math.random() * 2.2
      this.saccadeOffsetX = (Math.random() - 0.5) * 0.06
      this.saccadeOffsetY = (Math.random() - 0.5) * 0.04
    }

    // 4. Involuntary randomized blinking
    this.blinkTimer += delta
    if (!this.isBlinking && this.blinkTimer >= this.nextBlinkTime) {
      this.isBlinking = true
      this.blinkTimer = 0
      this.blinkProgress = 0
      this.isDoubleBlink = Math.random() < 0.22
    }

    if (this.isBlinking) {
      // 110ms blink duration
      this.blinkProgress += delta * 9.0
      if (this.blinkProgress >= 1.0) {
        if (this.isDoubleBlink) {
          this.isDoubleBlink = false
          this.blinkProgress = 0
        } else {
          this.isBlinking = false
          this.blinkProgress = 0
          this.nextBlinkTime = 2.8 + Math.random() * 3.5
        }
      }
    }

    // Blink curve: smooth parabolic closure
    const blinkWeight = this.isBlinking ? Math.sin(this.blinkProgress * Math.PI) : 0

    // 5. Touch pulse progress
    if (this.isTouchPulsing) {
      this.touchPulseProgress += delta * 2.2
      if (this.touchPulseProgress >= 1.0) {
        this.isTouchPulsing = false
        this.touchPulseProgress = 0
      }
    }

    // 6. Nod gesture progress
    let nodOffset = 0
    if (this.isNodding) {
      this.nodProgress += delta * 3.2
      nodOffset = Math.sin(this.nodProgress * Math.PI) * 0.09
      if (this.nodProgress >= 1.0) {
        this.isNodding = false
        this.nodProgress = 0
      }
    }

    // ==========================================
    // SKELETON ROTATION & GAZE HIERARCHY
    // ==========================================
    // Base target angles from pointer
    const gazeX = this.smoothedPointer.x
    const gazeY = this.smoothedPointer.y

    // Additional state-specific offsets
    let stateHeadTiltZ = 0
    let stateHeadPitchX = 0
    let stateHeadYawY = 0

    if (this.currentState === 'CURIOUS') {
      stateHeadTiltZ = 0.07 // Inquisitive head tilt
      stateHeadPitchX = -0.04
    } else if (this.currentState === 'THINKING') {
      stateHeadYawY = 0.12 // Gaze shifts aside
      stateHeadPitchX = -0.06
    } else if (this.currentState === 'SPEAKING') {
      stateHeadPitchX = lipSync.speechHeadNod * 0.5
    }

    // A. Head Bone (smooth, responsive tracking of mouse point)
    const headPitch = -gazeY * 0.36 + stateHeadPitchX + nodOffset
    const headYaw = gazeX * 0.46 + stateHeadYawY
    const headRoll = stateHeadTiltZ - gazeX * 0.08
    model.rotateBoneRelative('head', headPitch, headYaw, headRoll)

    // B. Neck Bone (supporting natural neck articulation & subtle breath)
    const neckPitch = -gazeY * 0.16 + breathSin * 0.012
    const neckYaw = gazeX * 0.20
    model.rotateBoneRelative('neck', neckPitch, neckYaw, 0)

    // C. Left & Right Eyes (Sharp leading gaze lock + micro-saccades)
    const eyePitch = -gazeY * 0.40 + this.saccadeOffsetY
    const eyeYaw = gazeX * 0.48 + this.saccadeOffsetX
    model.rotateBoneRelative('leftEye', eyePitch, eyeYaw, 0)
    model.rotateBoneRelative('rightEye', eyePitch, eyeYaw, 0)

    // ==========================================
    // FACIAL MORPH TARGET BLENDSHAPES
    // ==========================================
    // Apply blinking
    model.setMorphTarget('eyeBlinkLeft', blinkWeight)
    model.setMorphTarget('eyeBlinkRight', blinkWeight)

    // State expressions
    if (this.currentState === 'CURIOUS') {
      model.setMorphTarget('browInnerUp', 0.45)
      model.setMorphTarget('mouthSmileLeft', 0.25)
      model.setMorphTarget('mouthSmileRight', 0.25)
    } else if (this.currentState === 'THINKING') {
      model.setMorphTarget('browDownLeft', 0.25)
      model.setMorphTarget('browDownRight', 0.25)
      model.setMorphTarget('mouthPucker', 0.2)
    } else if (this.currentState === 'RESPONDING') {
      model.setMorphTarget('mouthSmileLeft', 0.45)
      model.setMorphTarget('mouthSmileRight', 0.45)
      model.setMorphTarget('browInnerUp', 0.3)
    } else if (this.currentState === 'AWARE' || this.currentState === 'ENGAGED') {
      model.setMorphTarget('mouthSmileLeft', 0.18)
      model.setMorphTarget('mouthSmileRight', 0.18)
      model.setMorphTarget('browInnerUp', 0.15)
    } else {
      model.setMorphTarget('mouthSmileLeft', 0.06)
      model.setMorphTarget('mouthSmileRight', 0.06)
      model.setMorphTarget('browInnerUp', 0.05)
    }

    // Update talking & viseme stream
    lipSync.update(delta, model)
  }
}
