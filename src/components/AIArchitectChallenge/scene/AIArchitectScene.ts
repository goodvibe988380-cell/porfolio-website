import * as THREE from 'three'
import { AICoreMesh } from './AICoreMesh'
import { ArchitectureNodesManager } from './ArchitectureNodes'
import { EnergyConduitsManager } from './EnergyConduits'
import { ColorfulParticleCosmos } from './ColorfulParticleCosmos'
import { type ArchitectureStepId } from '../types'

export interface SceneCallbacks {
  onNodeClick: (id: ArchitectureStepId) => void
  onNodeHover: (id: ArchitectureStepId | null) => void
}

export class AIArchitectScene {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private callbacks: SceneCallbacks
  
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private clock: THREE.Clock
  
  public aiCore: AICoreMesh
  public nodes: ArchitectureNodesManager
  public conduits: EnergyConduitsManager
  public particles: ColorfulParticleCosmos

  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2(-999, -999)
  private pointerWorld = new THREE.Vector3(0, 0, 0)
  private hasPointer = false
  private hoveredNodeId: ArchitectureStepId | null = null

  private targetCamPos = new THREE.Vector3(0, 0.2, 8.8)
  private baseCamPos = new THREE.Vector3(0, 0.2, 8.8)
  private isRunning = false
  private animId = 0
  private resizeObserver: ResizeObserver | null = null
  public reducedMotion = false

  constructor(container: HTMLElement, canvas: HTMLCanvasElement, callbacks: SceneCallbacks) {
    this.container = container
    this.canvas = canvas
    this.callbacks = callbacks
    this.clock = new THREE.Clock()

    // 1. Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#030712')

    // 2. Camera with dynamic framing
    const width = container.clientWidth || 800
    const height = container.clientHeight || 560
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    this.calculateCameraPosition(width, height)
    this.camera.position.copy(this.baseCamPos)

    // 3. Renderer with clamped DPR
    const isMobile = width < 768
    const maxDpr = isMobile ? 1.25 : 1.75
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      alpha: false,
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(dpr)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    // 4. Vibrant Cyberpunk Lighting
    this.setupLighting()

    // 5. Build 3D Components
    // Central AI Core
    this.aiCore = new AICoreMesh()
    this.scene.add(this.aiCore.group)

    // 7 Architecture Nodes
    this.nodes = new ArchitectureNodesManager()
    this.scene.add(this.nodes.group)

    // Glowing Conduits & Flowing Photons
    this.conduits = new EnergyConduitsManager()
    this.scene.add(this.conduits.group)

    // High-Vibrancy 3D Colorful Particle Cosmos
    this.particles = new ColorfulParticleCosmos()
    this.scene.add(this.particles.group)

    // 6. Interactive Event Listeners
    this.initInteraction()

    // 7. Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize())
    this.resizeObserver.observe(this.container)
  }

  private calculateCameraPosition(width: number, height: number) {
    const aspect = width / height
    // Nodes span X: -6.2 to +6.2 (width 12.4).
    // Ensure all 7 nodes fit comfortably within horizontal view bounds
    const halfWidthNeeded = 7.6
    const vFovRad = (this.camera.fov * Math.PI) / 360
    const calculatedZ = halfWidthNeeded / (Math.tan(vFovRad) * aspect)
    
    const maxZ = aspect < 1.0 ? 17.2 : 14.5
    const camZ = Math.max(8.8, Math.min(calculatedZ, maxZ))
    this.baseCamPos.set(0, 0.2, camZ)
    this.targetCamPos.copy(this.baseCamPos)
  }

  private setupLighting() {
    // Ambient deep indigo fill
    const ambient = new THREE.AmbientLight(0x0a1026, 1.6)
    this.scene.add(ambient)

    // Main volumetric electric cyan key light
    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 2.4)
    dirLight1.position.set(6, 7, 7)
    this.scene.add(dirLight1)

    // Magenta / purple rim light
    const dirLight2 = new THREE.DirectionalLight(0xd946ef, 1.8)
    dirLight2.position.set(-7, -4, 5)
    this.scene.add(dirLight2)

    // Warm solar gold fill
    const dirLight3 = new THREE.DirectionalLight(0xf59e0b, 1.3)
    dirLight3.position.set(0, -6, 4)
    this.scene.add(dirLight3)

    // Top cyber point light
    const topLight = new THREE.PointLight(0x38bdf8, 2.5, 18)
    topLight.position.set(0, 6, 4)
    this.scene.add(topLight)
  }

  private initInteraction() {
    const updatePointer = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect()
      this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
      this.hasPointer = true

      // Project pointer onto world plane Z = 0 for particle repulsion
      const vector = new THREE.Vector3(this.pointer.x, this.pointer.y, 0.5)
      vector.unproject(this.camera)
      const dir = vector.sub(this.camera.position).normalize()
      const distance = -this.camera.position.z / dir.z
      this.pointerWorld.copy(this.camera.position).add(dir.multiplyScalar(distance))
    }

    this.canvas.addEventListener('mousemove', (e) => {
      updatePointer(e.clientX, e.clientY)
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.pointer.set(-999, -999)
      this.hasPointer = false
      if (this.hoveredNodeId) {
        this.hoveredNodeId = null
        this.nodes.setHoveredNode(null)
        this.callbacks.onNodeHover(null)
      }
    })

    const handleClick = (clientX: number, clientY: number) => {
      updatePointer(clientX, clientY)
      this.raycaster.setFromCamera(this.pointer, this.camera)
      const intersects = this.raycaster.intersectObjects(this.nodes.raycastMeshes, false)

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object
        const nodeId = clickedMesh.userData?.nodeId as ArchitectureStepId
        if (nodeId) {
          this.callbacks.onNodeClick(nodeId)
        }
      }
    }

    this.canvas.addEventListener('click', (e) => {
      handleClick(e.clientX, e.clientY)
    })

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        handleClick(e.touches[0].clientX, e.touches[0].clientY)
      }
    }, { passive: true })
  }

  /** Camera zoom to active node */
  public focusNode(pos: [number, number, number]) {
    if (this.reducedMotion) return
    this.targetCamPos.set(pos[0] * 0.25, pos[1] * 0.25 + 0.2, this.baseCamPos.z - 1.2)
    setTimeout(() => {
      this.targetCamPos.copy(this.baseCamPos)
    }, 750)
  }

  /** Trigger camera push on 100% completion */
  public setCompletionCamera() {
    this.targetCamPos.set(0, 0, 5.8)
    this.particles.setSupernova(true)
  }

  /** Reset camera to baseline */
  public resetCamera() {
    this.targetCamPos.copy(this.baseCamPos)
    this.particles.setSupernova(false)
  }

  /** Update excitement level as system builds */
  public setProgress(completedCount: number, totalCount: number) {
    this.particles.setExcitement(completedCount / totalCount)
  }

  private handleResize() {
    const width = this.container.clientWidth || 800
    const height = this.container.clientHeight || 560

    this.camera.aspect = width / height
    this.calculateCameraPosition(width, height)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  /** Start loop */
  public start() {
    if (this.isRunning) return
    this.isRunning = true
    this.clock.start()
    this.tick()
  }

  /** Stop loop (when out of viewport) */
  public stop() {
    this.isRunning = false
    cancelAnimationFrame(this.animId)
  }

  private tick = () => {
    if (!this.isRunning) return

    const delta = Math.min(this.clock.getDelta(), 0.1)

    // Raycast hover test
    if (this.pointer.x > -2 && this.pointer.y > -2) {
      this.raycaster.setFromCamera(this.pointer, this.camera)
      const intersects = this.raycaster.intersectObjects(this.nodes.raycastMeshes, false)

      let newHoverId: ArchitectureStepId | null = null
      if (intersects.length > 0) {
        newHoverId = intersects[0].object.userData?.nodeId || null
      }

      if (newHoverId !== this.hoveredNodeId) {
        this.hoveredNodeId = newHoverId
        this.nodes.setHoveredNode(newHoverId)
        this.callbacks.onNodeHover(newHoverId)
        this.canvas.style.cursor = newHoverId ? 'pointer' : 'default'
      }
    }

    // Smooth camera interpolation
    this.camera.position.lerp(this.targetCamPos, 0.065)

    // Update child managers
    this.aiCore.update(delta, this.reducedMotion)
    this.nodes.update(delta, this.reducedMotion)
    this.conduits.update(delta, this.reducedMotion)
    this.particles.update(delta, this.hasPointer ? this.pointerWorld : undefined, this.reducedMotion)

    this.renderer.render(this.scene, this.camera)

    this.animId = requestAnimationFrame(this.tick)
  }

  public dispose() {
    this.stop()
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    this.aiCore.dispose()
    this.nodes.dispose()
    this.conduits.dispose()
    this.particles.dispose()

    this.renderer.dispose()
    this.scene.clear()
  }
}
