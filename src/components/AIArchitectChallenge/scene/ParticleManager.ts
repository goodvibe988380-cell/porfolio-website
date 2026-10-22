import * as THREE from 'three'

interface Spark {
  active: boolean
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
  maxLife: number
  colorR: number
  colorG: number
  colorB: number
}

/**
 * ParticleManager — High-Performance Pooled Particle System
 * Manages spark bursts upon core pickup and impact shockwaves upon collision.
 */
export class ParticleManager {
  public group: THREE.Group
  private readonly MAX_PARTICLES = 160
  private sparks: Spark[] = []

  private points!: THREE.Points
  private positions!: Float32Array
  private colors!: Float32Array

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'ParticleEffects'
    this.initSystem()
  }

  private initSystem(): void {
    this.positions = new Float32Array(this.MAX_PARTICLES * 3)
    this.colors = new Float32Array(this.MAX_PARTICLES * 3)

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.sparks.push({
        active: false,
        x: 0,
        y: 0,
        z: -999,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1.0,
        colorR: 0,
        colorG: 1,
        colorB: 1,
      })
      this.positions[i * 3 + 2] = -999
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(geo, mat)
    this.group.add(this.points)
  }

  public triggerCollectBurst(pos: THREE.Vector3, isShard = false): void {
    const count = 16
    let spawned = 0

    const color = isShard ? [1.0, 0.72, 0.1] : [0.0, 0.95, 1.0]

    for (let i = 0; i < this.MAX_PARTICLES && spawned < count; i++) {
      const s = this.sparks[i]
      if (s.active) continue

      s.active = true
      s.x = pos.x
      s.y = pos.y
      s.z = pos.z

      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 4.5 + 2.0
      s.vx = Math.cos(angle) * speed
      s.vy = Math.sin(angle) * speed + 1.2
      s.vz = (Math.random() - 0.5) * 3.0

      s.life = 0
      s.maxLife = Math.random() * 0.28 + 0.22
      s.colorR = color[0]
      s.colorG = color[1]
      s.colorB = color[2]

      spawned++
    }
  }

  public triggerCollisionShockwave(pos: THREE.Vector3): void {
    const count = 48
    let spawned = 0

    for (let i = 0; i < this.MAX_PARTICLES && spawned < count; i++) {
      const s = this.sparks[i]
      if (s.active) continue

      s.active = true
      s.x = pos.x
      s.y = pos.y
      s.z = pos.z

      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const speed = Math.random() * 8.5 + 3.0

      s.vx = Math.sin(phi) * Math.cos(theta) * speed
      s.vy = Math.cos(phi) * speed + 2.0
      s.vz = Math.sin(phi) * Math.sin(theta) * speed

      s.life = 0
      s.maxLife = Math.random() * 0.45 + 0.35
      // Fiery magenta / electric pink
      s.colorR = 1.0
      s.colorG = Math.random() * 0.2
      s.colorB = Math.random() * 0.6 + 0.3

      spawned++
    }
  }

  public update(delta: number): void {
    let hasActive = false

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const s = this.sparks[i]
      const idx = i * 3

      if (!s.active) {
        this.positions[idx + 2] = -999
        continue
      }

      hasActive = true
      s.life += delta
      if (s.life >= s.maxLife) {
        s.active = false
        this.positions[idx + 2] = -999
        continue
      }

      s.x += s.vx * delta
      s.y += s.vy * delta
      s.z += s.vz * delta
      s.vy -= 9.8 * delta // Gravity

      const fade = 1.0 - s.life / s.maxLife
      this.positions[idx] = s.x
      this.positions[idx + 1] = s.y
      this.positions[idx + 2] = s.z

      this.colors[idx] = s.colorR * fade
      this.colors[idx + 1] = s.colorG * fade
      this.colors[idx + 2] = s.colorB * fade
    }

    if (hasActive) {
      this.points.geometry.attributes.position.needsUpdate = true
      this.points.geometry.attributes.color.needsUpdate = true
    }
  }

  public reset(): void {
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.sparks[i].active = false
      this.positions[i * 3 + 2] = -999
    }
    this.points.geometry.attributes.position.needsUpdate = true
  }

  public dispose(): void {
    this.points.geometry.dispose()
    ;(this.points.material as THREE.Material).dispose()
    this.group.clear()
  }
}
