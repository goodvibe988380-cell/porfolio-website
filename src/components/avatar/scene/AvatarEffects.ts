import * as THREE from 'three'

export class AvatarEffects {
  public group: THREE.Group

  private floorRing1: THREE.Mesh
  private floorRing2: THREE.Mesh
  private floorRing3: THREE.Mesh
  private particles: THREE.Points
  private particlePositions: Float32Array

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'AvatarCyberEffects'

    // 1. Concentric Holographic Floor Contact Rings (beneath sneakers)
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })

    const ringGeo1 = new THREE.RingGeometry(0.24, 0.255, 64)
    this.floorRing1 = new THREE.Mesh(ringGeo1, ringMat1)
    this.floorRing1.rotation.x = -Math.PI / 2
    this.floorRing1.position.y = -0.30
    this.group.add(this.floorRing1)

    const ringGeo2 = new THREE.RingGeometry(0.35, 0.365, 64)
    this.floorRing2 = new THREE.Mesh(ringGeo2, ringMat2)
    this.floorRing2.rotation.x = -Math.PI / 2
    this.floorRing2.position.y = -0.305
    this.group.add(this.floorRing2)

    const ringGeo3 = new THREE.RingGeometry(0.46, 0.475, 64)
    this.floorRing3 = new THREE.Mesh(ringGeo3, ringMat3)
    this.floorRing3.rotation.x = -Math.PI / 2
    this.floorRing3.position.y = -0.31
    this.group.add(this.floorRing3)

    // 2. Ambient Cyber Motes (Subtle, never obscuring the face)
    const particleCount = 50
    this.particlePositions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3
      this.particlePositions[idx] = (Math.random() - 0.5) * 2.2
      this.particlePositions[idx + 1] = (Math.random() - 0.5) * 1.6
      this.particlePositions[idx + 2] = (Math.random() - 0.5) * 1.0 - 0.3 // Mostly behind or to sides
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.016,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    })
    this.particles = new THREE.Points(particleGeo, particleMat)
    this.group.add(this.particles)
  }

  public update(time: number, pulse: number, energyLevel: number): void {
    // Slow concentric rotation
    this.floorRing1.rotation.z = time * 0.15
    this.floorRing2.rotation.z = -time * 0.09
    this.floorRing3.rotation.z = time * 0.06

    // Pulse response on touch/interaction
    const pulseScale = 1 + pulse * 0.25
    this.floorRing1.scale.set(pulseScale, pulseScale, 1)
    this.floorRing2.scale.set(1 + pulse * 0.15, 1 + pulse * 0.15, 1)

    ;(this.floorRing1.material as THREE.MeshBasicMaterial).opacity = 0.55 * energyLevel + pulse * 0.35
    ;(this.floorRing2.material as THREE.MeshBasicMaterial).opacity = 0.35 * energyLevel + pulse * 0.25

    // Subtle drift of ambient particles
    const positions = this.particles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length / 3; i++) {
      const iy = i * 3 + 1
      positions[iy] += 0.0008
      if (positions[iy] > 1.4) positions[iy] = -1.2
    }
    this.particles.geometry.attributes.position.needsUpdate = true
  }

  public dispose(): void {
    this.floorRing1.geometry.dispose()
    ;(this.floorRing1.material as THREE.Material).dispose()
    this.floorRing2.geometry.dispose()
    ;(this.floorRing2.material as THREE.Material).dispose()
    this.floorRing3.geometry.dispose()
    ;(this.floorRing3.material as THREE.Material).dispose()
    this.particles.geometry.dispose()
    ;(this.particles.material as THREE.Material).dispose()
  }
}
