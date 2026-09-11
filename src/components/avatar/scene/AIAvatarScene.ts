import * as THREE from 'three'
import { PersonalAvatarModel } from './PersonalAvatarModel'
import { AvatarLighting } from './AvatarLighting'
import { AvatarEffects } from './AvatarEffects'
import { AvatarController, type AvatarState, type PointerTarget } from './AvatarController'
import { LipSyncController } from './LipSyncController'

export interface AIAvatarSceneOptions {
  container: HTMLDivElement
  onStateChange?: (state: AvatarState) => void
  onModelLoaded?: () => void
}

export class AIAvatarScene {
  private container: HTMLDivElement
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer

  // Subsystems
  public avatarModel: PersonalAvatarModel
  public lighting: AvatarLighting
  public effects: AvatarEffects
  public controller: AvatarController
  public lipSync: LipSyncController

  // Timing & Lifecycle
  private animFrameId: number | null = null
  private lastTime = 0
  private isVisible = true
  private observer: IntersectionObserver | null = null

  // Pointer & Touch
  private pointer: PointerTarget = {
    x: 0,
    y: 0,
    isInside: false,
    isTouch: false,
  }

  // Bound handlers
  private handleResizeBound: () => void
  private handleVisibilityChangeBound: () => void

  constructor(options: AIAvatarSceneOptions) {
    this.container = options.container
    this.lastTime = performance.now() * 0.001

    // 1. Scene
    this.scene = new THREE.Scene()

    // 2. Camera (Cinematic 3D portrait framing on Santhosh)
    const width = Math.max(1, this.container.clientWidth)
    const height = Math.max(1, this.container.clientHeight)
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50)
    this.updateCameraPosition(width, height)

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.3
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    this.renderer.domElement.style.display = 'block'
    this.renderer.domElement.style.pointerEvents = 'none' // React container handles pointers
    this.container.appendChild(this.renderer.domElement)

    // 4. Subsystems
    this.lighting = new AvatarLighting()
    this.scene.add(this.lighting.group)

    this.effects = new AvatarEffects()
    this.scene.add(this.effects.group)

    this.lipSync = new LipSyncController()

    this.avatarModel = new PersonalAvatarModel()
    this.scene.add(this.avatarModel.group)

    // Load authentic 3D character
    this.avatarModel
      .load('/models/santhosh-digital-human.glb')
      .then(() => {
        if (options.onModelLoaded) {
          options.onModelLoaded()
        }
      })
      .catch((err) => {
        console.error('Failed to load 3D character model:', err)
      })

    this.controller = new AvatarController((state) => {
      if (options.onStateChange) {
        options.onStateChange(state)
      }
    })

    // 5. Window & Document Events
    this.handleResizeBound = this.handleResize.bind(this)
    this.handleVisibilityChangeBound = this.handleVisibilityChange.bind(this)

    window.addEventListener('resize', this.handleResizeBound)
    document.addEventListener('visibilitychange', this.handleVisibilityChangeBound)

    // 6. Intersection Observer (Power saving when offscreen)
    this.setupIntersectionObserver()

    // 7. Start Render Loop
    this.animate()
  }

  private updateCameraPosition(width: number, height: number): void {
    const aspect = width / height
    if (aspect < 0.8) {
      // Mobile prominent face framing
      this.camera.position.set(0, 0.02, 1.05)
      this.camera.lookAt(0, 0.015, 0)
    } else if (aspect < 1.3) {
      // Tablet face framing
      this.camera.position.set(0, 0.02, 0.92)
      this.camera.lookAt(0, 0.015, 0)
    } else {
      // Desktop Cinematic prominent face framing (face fills 60-70% of frame)
      this.camera.position.set(0, 0.02, 0.82)
      this.camera.lookAt(0, 0.015, 0)
    }
  }

  public setPointer(x: number, y: number, isInside: boolean, isTouch = false): void {
    this.pointer.x = x
    this.pointer.y = y
    this.pointer.isInside = isInside
    this.pointer.isTouch = isTouch

    this.controller.setPointer(x, y, isInside, isTouch)
    this.lighting.setPointerLighting(x, y)
  }

  public handleTouchStart(): void {
    this.controller.triggerPulse()
  }

  public speak(text: string, onStart?: () => void, onEnd?: () => void): void {
    this.controller.setState('SPEAKING')
    this.lipSync.speak(
      text,
      () => {
        if (onStart) onStart()
      },
      () => {
        this.controller.setState('IDLE')
        if (onEnd) onEnd()
      }
    )
  }

  public stopSpeaking(): void {
    this.lipSync.stopSpeaking()
    if (this.controller.getState() === 'SPEAKING') {
      this.controller.setState('IDLE')
    }
  }

  public isSpeaking(): boolean {
    return this.lipSync.isSpeaking()
  }

  public setState(state: AvatarState): void {
    this.controller.setState(state)
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate)

    if (!this.isVisible) return

    const now = performance.now() * 0.001
    const delta = Math.min(now - this.lastTime, 0.1) // clamp delta
    this.lastTime = now

    // 1. Update Rigging, Blinking, Gaze & Morph Targets
    this.controller.update(delta, this.avatarModel, this.lipSync)

    // 2. Update Lighting response
    const pulse = this.controller.getPulse()
    const energyLevel = this.controller.getEnergyLevel()
    this.lighting.update(pulse, energyLevel)

    // 3. Update Floor effects & particles
    this.effects.update(now, pulse, energyLevel)

    // 4. Subtle camera parallax with mouse
    const targetCamX = this.pointer.x * 0.04
    const targetCamY = 0.02 + this.pointer.y * 0.03
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.05
    this.camera.lookAt(0, 0.015, 0)

    // 5. Render
    this.renderer.render(this.scene, this.camera)
  }

  private handleResize(): void {
    if (!this.container) return
    const width = Math.max(1, this.container.clientWidth)
    const height = Math.max(1, this.container.clientHeight)

    this.camera.aspect = width / height
    this.updateCameraPosition(width, height)
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  }

  private handleVisibilityChange(): void {
    this.isVisible = document.visibilityState === 'visible'
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting && document.visibilityState === 'visible'
        })
      },
      { threshold: 0.05 }
    )
    this.observer.observe(this.container)
  }

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
    }

    window.removeEventListener('resize', this.handleResizeBound)
    document.removeEventListener('visibilitychange', this.handleVisibilityChangeBound)

    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }

    this.lipSync.stopSpeaking()
    this.avatarModel.dispose()
    this.effects.dispose()

    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
    this.renderer.dispose()
  }
}
