import * as THREE from 'three'
import {
  type GameStats,
  type LaneIndex,
} from '../types'
import { HovercraftMesh } from './HovercraftMesh'
import { TunnelMesh } from './TunnelMesh'
import { ObstacleManager } from './ObstacleManager'
import { CollectibleManager } from './CollectibleManager'
import { ParticleManager } from './ParticleManager'
import { SoundManager } from './SoundManager'

export interface NeonCoreRunSceneOptions {
  container: HTMLDivElement
  canvas: HTMLCanvasElement
  onStatsUpdate: (stats: GameStats) => void
  onGameOver: (finalStats: GameStats) => void
  onCoreCollected: (points: number, combo: number) => void
  onLaneChange?: (lane: LaneIndex) => void
}

/**
 * NeonCoreRunScene — Master 3D Arcade Game Engine
 * Manages Three.js rendering, camera dynamics, collision pipeline, and audio.
 */
export class NeonCoreRunScene {
  private container: HTMLDivElement
  private canvas: HTMLCanvasElement
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer

  // Game Subsystems
  public hovercraft: HovercraftMesh
  public tunnel: TunnelMesh
  public obstacles: ObstacleManager
  public collectibles: CollectibleManager
  public particles: ParticleManager
  public sound: SoundManager

  // Lights
  private craftPointLight: THREE.PointLight

  // Gameplay Run State
  public isRunning = false
  public isPaused = false
  private speed = 28.0 // Base speed in meters per second
  private readonly MIN_SPEED = 28.0
  private readonly MAX_SPEED = 54.0
  private distance = 0
  private score = 0
  private coresCollected = 0
  private multiplier = 1
  private comboTimer = 0
  private energy = 100
  private highScore = 0

  // Camera Dynamics
  private readonly BASE_CAM_Y = 2.3
  private readonly BASE_CAM_Z = 5.2
  private camShakeTime = 0
  private camShakeIntensity = 0

  // Animation Timing
  private animFrameId: number | null = null
  private lastTime = 0
  private totalRunTime = 0

  // Callbacks
  private onStatsUpdate: (stats: GameStats) => void
  private onGameOver: (finalStats: GameStats) => void
  private onCoreCollected: (points: number, combo: number) => void
  private onLaneChange?: (lane: LaneIndex) => void

  constructor(options: NeonCoreRunSceneOptions) {
    this.container = options.container
    this.canvas = options.canvas
    this.onStatsUpdate = options.onStatsUpdate
    this.onGameOver = options.onGameOver
    this.onCoreCollected = options.onCoreCollected
    this.onLaneChange = options.onLaneChange

    // Load High Score from localStorage
    try {
      const saved = localStorage.getItem('neon_core_run_highscore')
      if (saved) this.highScore = parseInt(saved, 10) || 0
    } catch {
      this.highScore = 0
    }

    // 1. Scene
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x030612, 0.016)

    // 2. Camera
    const width = Math.max(1, this.container.clientWidth)
    const height = Math.max(1, this.container.clientHeight)
    this.camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 180)
    this.camera.position.set(0, this.BASE_CAM_Y, this.BASE_CAM_Z)
    this.camera.lookAt(0, 1.2, -8.0)

    // 3. Renderer
    const isMobile = window.innerWidth <= 768
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.35
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    // 4. Lighting (Atmospheric Cyber Glow)
    const ambientLight = new THREE.AmbientLight(0x080f24, 1.2)
    this.scene.add(ambientLight)

    const cyanKeyLight = new THREE.DirectionalLight(0x00f0ff, 2.2)
    cyanKeyLight.position.set(0, 8, -12)
    this.scene.add(cyanKeyLight)

    const magentaFillLight = new THREE.DirectionalLight(0xff007f, 1.4)
    magentaFillLight.position.set(-6, 4, 10)
    this.scene.add(magentaFillLight)

    // Dynamic point light tracking player craft
    this.craftPointLight = new THREE.PointLight(0x00ffff, 2.5, 9)
    this.craftPointLight.position.set(0, 1.2, 0)
    this.scene.add(this.craftPointLight)

    // 5. Initialize Subsystems
    this.sound = new SoundManager()

    this.tunnel = new TunnelMesh()
    this.scene.add(this.tunnel.group)

    this.hovercraft = new HovercraftMesh()
    this.scene.add(this.hovercraft.group)

    this.obstacles = new ObstacleManager()
    this.scene.add(this.obstacles.group)

    this.collectibles = new CollectibleManager()
    this.scene.add(this.collectibles.group)

    this.particles = new ParticleManager()
    this.scene.add(this.particles.group)

    // Initial render
    this.renderer.render(this.scene, this.camera)
  }

  public startRun(): void {
    this.resetRunState()
    this.isRunning = true
    this.isPaused = false
    this.lastTime = performance.now() * 0.001
    this.sound.startEngine()

    if (this.animFrameId === null) {
      this.animate()
    }
  }

  public pauseRun(): void {
    this.isPaused = true
    this.sound.stopEngine()
  }

  public resumeRun(): void {
    if (!this.isRunning) return
    this.isPaused = false
    this.lastTime = performance.now() * 0.001
    this.sound.startEngine()
  }

  public triggerGameOver(): void {
    this.isRunning = false
    this.isPaused = false
    this.sound.stopEngine()
    this.sound.playCollision()

    // Trigger visual effects
    this.particles.triggerCollisionShockwave(this.hovercraft.group.position)
    this.triggerCameraShake(0.5, 0.45)

    // Save High Score
    if (this.score > this.highScore) {
      this.highScore = this.score
      try {
        localStorage.setItem('neon_core_run_highscore', String(this.highScore))
      } catch {
        // Ignored
      }
    }

    const finalStats: GameStats = {
      score: this.score,
      distance: Math.floor(this.distance),
      coresCollected: this.coresCollected,
      multiplier: this.multiplier,
      speed: Math.floor(this.speed),
      energy: Math.floor(this.energy),
      highScore: this.highScore,
    }

    this.onGameOver(finalStats)
  }

  public shiftLane(direction: -1 | 1): void {
    if (!this.isRunning || this.isPaused) return
    const shifted = this.hovercraft.shiftLane(direction)
    if (shifted) {
      this.sound.playLaneSwitch()
      this.onLaneChange?.(this.hovercraft.currentLane)
    }
  }

  public setLane(lane: LaneIndex): void {
    if (!this.isRunning || this.isPaused) return
    if (this.hovercraft.currentLane !== lane) {
      this.hovercraft.setLane(lane)
      this.sound.playLaneSwitch()
      this.onLaneChange?.(lane)
    }
  }

  public jump(): void {
    if (!this.isRunning || this.isPaused) return
    const jumped = this.hovercraft.jump()
    if (jumped) {
      this.sound.playJump()
    }
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate)

    const now = performance.now() * 0.001
    const delta = Math.min(now - this.lastTime, 0.05)
    this.lastTime = now

    if (this.isRunning && !this.isPaused) {
      this.updateSimulation(delta, now)
    }

    // Always render particles / camera dynamics
    if (this.camShakeTime > 0) {
      this.camShakeTime -= delta
    }

    this.updateCamera(delta)
    this.renderer.render(this.scene, this.camera)
  }

  private updateSimulation(delta: number, now: number): void {
    this.totalRunTime += delta

    // 1. Dynamic Speed Progression (Scales smoothly with distance)
    const speedRatio = Math.min(1.0, this.distance / 1200)
    this.speed = this.MIN_SPEED + speedRatio * (this.MAX_SPEED - this.MIN_SPEED)
    this.sound.updateEnginePitch(speedRatio)

    // 2. Distance & Score Accumulation
    this.distance += this.speed * delta
    this.score += Math.floor(this.speed * delta * 1.8 * this.multiplier)

    // 3. Combo Multiplier Decay
    if (this.multiplier > 1) {
      this.comboTimer -= delta
      if (this.comboTimer <= 0) {
        this.multiplier = 1
      }
    }

    // 4. Update Subsystems
    this.hovercraft.update(delta, now)
    this.tunnel.update(delta, this.speed)

    // Update Player Craft Point Light
    this.craftPointLight.position.set(
      this.hovercraft.currentX,
      this.hovercraft.currentY + 0.4,
      0
    )

    // 5. Update Collectibles & Collision
    const collected = this.collectibles.update(
      delta,
      this.speed,
      now,
      this.hovercraft
    )

    if (collected.length > 0) {
      collected.forEach((item) => {
        this.coresCollected++
        this.score += item.value * this.multiplier
        this.energy = Math.min(100, this.energy + 8)

        // Increment combo multiplier up to 4x
        this.multiplier = Math.min(4, this.multiplier + 1)
        this.comboTimer = 3.8 // 3.8 seconds window to chain cores

        // Audio and Particle feedback
        if (item.type === 'DATA_SHARD') {
          this.sound.playCollectShard()
        } else {
          this.sound.playCollectCore(this.multiplier)
        }
        this.particles.triggerCollectBurst(item.mesh.position, item.type === 'DATA_SHARD')
        this.onCoreCollected(item.value * this.multiplier, this.multiplier)
      })
    }

    // 6. Update Obstacles & Collision Check
    const hasCollided = this.obstacles.update(
      delta,
      this.speed,
      this.distance,
      this.hovercraft
    )

    if (hasCollided) {
      this.triggerGameOver()
      return
    }

    // 7. Update Particles
    this.particles.update(delta)

    // 8. Emit Stats to UI
    this.onStatsUpdate({
      score: this.score,
      distance: Math.floor(this.distance),
      coresCollected: this.coresCollected,
      multiplier: this.multiplier,
      speed: Math.floor(this.speed),
      energy: Math.floor(this.energy),
      highScore: this.highScore,
    })
  }

  private updateCamera(delta: number): void {
    // 1. Smooth Lateral Follow behind Hovercraft
    const targetCamX = this.hovercraft.currentX * 0.42
    this.camera.position.x += (targetCamX - this.camera.position.x) * Math.min(1, delta * 9)

    // 2. Camera Elevation follow during jump
    const jumpElev = Math.max(0, this.hovercraft.currentY - this.hovercraft.BASE_Y) * 0.4
    this.camera.position.y = this.BASE_CAM_Y + jumpElev

    // 3. Dynamic Velocity FOV Expansion
    const speedRatio = (this.speed - this.MIN_SPEED) / (this.MAX_SPEED - this.MIN_SPEED)
    const targetFov = 56 + speedRatio * 8.5
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, delta * 6)
    this.camera.updateProjectionMatrix()

    // 4. Camera Screen Shake (on collision)
    let shakeX = 0
    let shakeY = 0
    if (this.camShakeTime > 0) {
      const shakeAmt = this.camShakeIntensity * (this.camShakeTime / 0.5)
      shakeX = (Math.random() - 0.5) * shakeAmt
      shakeY = (Math.random() - 0.5) * shakeAmt
    }

    this.camera.position.x += shakeX
    this.camera.position.y += shakeY
    this.camera.lookAt(targetCamX * 0.3, 1.2 + jumpElev * 0.5, -8.0)
  }

  public triggerCameraShake(intensity = 0.4, duration = 0.45): void {
    this.camShakeIntensity = intensity
    this.camShakeTime = duration
  }

  public resetRunState(): void {
    this.speed = this.MIN_SPEED
    this.distance = 0
    this.score = 0
    this.coresCollected = 0
    this.multiplier = 1
    this.comboTimer = 0
    this.energy = 100
    this.totalRunTime = 0
    this.camShakeTime = 0

    this.hovercraft.reset()
    this.tunnel.reset()
    this.obstacles.reset()
    this.collectibles.reset()
    this.particles.reset()
    this.onLaneChange?.(0)

    this.camera.position.set(0, this.BASE_CAM_Y, this.BASE_CAM_Z)
    this.camera.lookAt(0, 1.2, -8.0)
  }

  public handleResize(): void {
    if (!this.container) return
    const width = Math.max(1, this.container.clientWidth)
    const height = Math.max(1, this.container.clientHeight)

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    const isMobile = window.innerWidth <= 768
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2))
  }

  public dispose(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }

    this.sound.dispose()
    this.hovercraft.dispose()
    this.tunnel.dispose()
    this.obstacles.dispose()
    this.collectibles.dispose()
    this.particles.dispose()
    this.renderer.dispose()
  }
}
