import * as THREE from 'three'

/**
 * Generates a smooth radial gradient circular particle texture
 * avoiding default square Three.js points and delivering luminous orbs.
 */
function createGlowParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

const PALETTE: THREE.Color[] = [
  new THREE.Color(0x00f0ff), // Electric Cyan
  new THREE.Color(0xff007f), // Neon Magenta
  new THREE.Color(0xfbbf24), // Solar Amber
  new THREE.Color(0xa855f7), // Neon Purple
  new THREE.Color(0x10b981), // Matrix Emerald
  new THREE.Color(0xf97316), // Plasma Orange
  new THREE.Color(0xffffff), // Diamond White
  new THREE.Color(0x38bdf8), // Sky Laser
]

export class ColorfulParticleCosmos {
  public group: THREE.Group
  private cosmicPoints: THREE.Points
  private vortexPoints: THREE.Points
  
  private cosmicGeo: THREE.BufferGeometry
  private vortexGeo: THREE.BufferGeometry

  private cosmicPositions: Float32Array
  private cosmicBasePositions: Float32Array
  private cosmicSpeeds: Float32Array
  private cosmicPhases: Float32Array
  private cosmicCount = 650

  private vortexPositions: Float32Array
  private vortexAngles: Float32Array
  private vortexRadii: Float32Array
  private vortexSpeeds: Float32Array
  private vortexCount = 220

  private particleTexture: THREE.CanvasTexture
  private time = 0
  private supernova = false
  private excitementLevel = 0.2 // Scales with completed stages (0.2 -> 1.0)

  constructor() {
    this.group = new THREE.Group()
    this.particleTexture = createGlowParticleTexture()

    // 1. Cosmic Ambient Field (wide 3D space)
    const { points: cosmicPts, geo: cGeo, pos: cPos, basePos: cbPos, speeds: cSpd, phases: cPhs } =
      this.buildCosmicField()
    this.cosmicPoints = cosmicPts
    this.cosmicGeo = cGeo
    this.cosmicPositions = cPos
    this.cosmicBasePositions = cbPos
    this.cosmicSpeeds = cSpd
    this.cosmicPhases = cPhs
    this.group.add(this.cosmicPoints)

    // 2. Core Vortex Swarm (orbiting AI Core)
    const { points: vortexPts, geo: vGeo, pos: vPos, angles: vAng, radii: vRad, speeds: vSpd } =
      this.buildVortexSwarm()
    this.vortexPoints = vortexPts
    this.vortexGeo = vGeo
    this.vortexPositions = vPos
    this.vortexAngles = vAng
    this.vortexRadii = vRad
    this.vortexSpeeds = vSpd
    this.group.add(this.vortexPoints)
  }

  private buildCosmicField() {
    const count = this.cosmicCount
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const basePos = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    const phases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Wide horizontal spread matching widescreen canvas (-14 to +14)
      const x = (Math.random() - 0.5) * 28
      const y = (Math.random() - 0.5) * 16
      const z = (Math.random() - 0.5) * 10 - 1.5

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      basePos[i * 3] = x
      basePos[i * 3 + 1] = y
      basePos[i * 3 + 2] = z

      // Pick vibrant color
      const col = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b

      speeds[i] = 0.3 + Math.random() * 0.7
      phases[i] = Math.random() * Math.PI * 2
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.16,
      map: this.particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const points = new THREE.Points(geo, mat)
    return { points, geo, pos, basePos, speeds, phases }
  }

  private buildVortexSwarm() {
    const count = this.vortexCount
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const angles = new Float32Array(count)
    const radii = new Float32Array(count)
    const speeds = new Float32Array(count)

    const coreColors = [
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0xff007f), // Magenta
      new THREE.Color(0xfbbf24), // Gold
      new THREE.Color(0xc084fc), // Purple
    ]

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 0.8 + Math.random() * 2.2
      const y = (Math.random() - 0.5) * 1.8 - 0.1
      const z = (Math.random() - 0.5) * 1.5

      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(angle) * radius * 0.5 + z

      angles[i] = angle
      radii[i] = radius
      speeds[i] = (0.6 + Math.random() * 0.8) * (Math.random() > 0.5 ? 1 : -1)

      const col = coreColors[i % coreColors.length]
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.14,
      map: this.particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const points = new THREE.Points(geo, mat)
    return { points, geo, pos, angles, radii, speeds }
  }

  /** Set completion supernova state */
  public setSupernova(active: boolean) {
    this.supernova = active
  }

  /** Update excitement level (0.2 -> 1.0) as more architecture nodes are connected */
  public setExcitement(progressNormalized: number) {
    this.excitementLevel = 0.2 + progressNormalized * 0.8
  }

  /** Animate particles every frame */
  public update(delta: number, pointerWorld?: THREE.Vector3, reducedMotion = false) {
    this.time += delta

    if (reducedMotion) return

    // 1. Update Cosmic Field: gentle floating wave oscillations + subtle drift
    const pos = this.cosmicPositions
    const basePos = this.cosmicBasePositions
    const speeds = this.cosmicSpeeds
    const phases = this.cosmicPhases

    for (let i = 0; i < this.cosmicCount; i++) {
      const idx = i * 3
      const spd = speeds[i]
      const phs = phases[i]

      // Vertical sine wave
      pos[idx + 1] = basePos[idx + 1] + Math.sin(this.time * spd + phs) * 0.4
      // Horizontal subtle wave
      pos[idx] = basePos[idx] + Math.cos(this.time * spd * 0.5 + phs) * 0.2

      // Interactive gentle repulsion if pointer is nearby
      if (pointerWorld) {
        const dx = pos[idx] - pointerWorld.x
        const dy = pos[idx + 1] - pointerWorld.y
        const distSq = dx * dx + dy * dy
        if (distSq < 4.0 && distSq > 0.001) {
          const dist = Math.sqrt(distSq)
          const force = (2.0 - dist) * 0.15
          pos[idx] += (dx / dist) * force
          pos[idx + 1] += (dy / dist) * force
        }
      }
    }
    this.cosmicGeo.attributes.position.needsUpdate = true

    // Subtle drift rotation of cosmic points
    this.cosmicPoints.rotation.z = Math.sin(this.time * 0.08) * 0.05

    // 2. Update Vortex Swarm: orbiting central AI Core
    const vPos = this.vortexPositions
    const vAngles = this.vortexAngles
    const vRadii = this.vortexRadii
    const vSpeeds = this.vortexSpeeds
    const speedMult = (this.supernova ? 3.5 : 1.0) * (0.8 + this.excitementLevel)

    for (let i = 0; i < this.vortexCount; i++) {
      const idx = i * 3
      vAngles[i] += vSpeeds[i] * delta * speedMult

      let currentRadius = vRadii[i]
      if (this.supernova) {
        // Expand outward during supernova
        currentRadius += Math.sin(this.time * 3 + i) * 0.8 + 0.6
      }

      const angle = vAngles[i]
      vPos[idx] = Math.cos(angle) * currentRadius
      // Inclined orbit tilt
      vPos[idx + 1] = Math.sin(angle * 2 + i) * 0.4 - 0.1
      vPos[idx + 2] = Math.sin(angle) * currentRadius * 0.55
    }
    this.vortexGeo.attributes.position.needsUpdate = true

    // Rotate vortex group
    this.vortexPoints.rotation.y += delta * 0.25 * speedMult
  }

  public dispose() {
    this.cosmicGeo.dispose()
    ;(this.cosmicPoints.material as THREE.Material).dispose()
    this.vortexGeo.dispose()
    ;(this.vortexPoints.material as THREE.Material).dispose()
    this.particleTexture.dispose()
  }
}
