import * as THREE from 'three'
import { LANE_WIDTH } from '../types'

/**
 * TunnelMesh — Endless High-Fidelity Cyber Tunnel
 * Features repeating neon hexagonal arch ribs, illuminated ground speed tracks,
 * pulsating energy conduit pipes, and streaming speed lines.
 */
export class TunnelMesh {
  public group: THREE.Group

  private rings: THREE.Group[] = []
  private readonly RING_COUNT = 36
  private readonly RING_SPACING = 4.2
  private readonly TUNNEL_LENGTH = 36 * 4.2 // ~151 units

  // Ground lanes
  private laneTracks!: THREE.Mesh
  private laneTrackMat!: THREE.MeshStandardMaterial

  // Ambient stars/dust particles
  private speedParticles!: THREE.Points
  private particlePositions!: Float32Array
  private readonly PARTICLE_COUNT = 320

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'CyberTunnel'
    this.buildTunnel()
  }

  private buildTunnel(): void {
    // 1. Shared Neon Rib Materials
    const cyanRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
    })

    const magentaRingMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
    })

    const darkFrameMat = new THREE.MeshStandardMaterial({
      color: 0x060914,
      metalness: 0.85,
      roughness: 0.35,
    })

    // 2. Build Hexagonal Arch Rings
    // Ring shape: Octagon/Hexagon arch
    const archRadius = 5.2
    const archThickness = 0.14
    const archSegments = 8

    const outerGeo = new THREE.CylinderGeometry(
      archRadius,
      archRadius,
      archThickness,
      archSegments,
      1,
      true
    )
    outerGeo.rotateZ(Math.PI / archSegments)

    const neonTrimGeo = new THREE.TorusGeometry(archRadius, 0.045, 6, archSegments)

    for (let i = 0; i < this.RING_COUNT; i++) {
      const ringGroup = new THREE.Group()

      // Dark structural outer ring
      const frameMesh = new THREE.Mesh(outerGeo, darkFrameMat)
      ringGroup.add(frameMesh)

      // Alternating cyan/magenta neon rim
      const isMagenta = i % 4 === 0
      const trimMesh = new THREE.Mesh(neonTrimGeo, isMagenta ? magentaRingMat : cyanRingMat)
      ringGroup.add(trimMesh)

      // Side pylon accents
      const pylonGeo = new THREE.BoxGeometry(0.2, 1.8, 0.2)
      const pylonMat = isMagenta ? magentaRingMat : cyanRingMat
      const leftPylon = new THREE.Mesh(pylonGeo, pylonMat)
      leftPylon.position.set(-archRadius * 0.9, 0, 0)
      ringGroup.add(leftPylon)

      const rightPylon = new THREE.Mesh(pylonGeo, pylonMat)
      rightPylon.position.set(archRadius * 0.9, 0, 0)
      ringGroup.add(rightPylon)

      // Position in space
      const zPos = 10 - i * this.RING_SPACING
      ringGroup.position.set(0, 2.2, zPos)

      this.rings.push(ringGroup)
      this.group.add(ringGroup)
    }

    // 3. Ground Cyber Grid Tracks (Visual Lane Demarcations)
    const trackWidth = LANE_WIDTH * 3 + 2.5
    const trackLength = 160
    const trackGeo = new THREE.PlaneGeometry(trackWidth, trackLength, 6, 40)
    trackGeo.rotateX(-Math.PI / 2)

    this.laneTrackMat = new THREE.MeshStandardMaterial({
      color: 0x050a18,
      roughness: 0.35,
      metalness: 0.8,
    })

    this.laneTracks = new THREE.Mesh(trackGeo, this.laneTrackMat)
    this.laneTracks.position.set(0, 0, -trackLength / 2 + 10)
    this.laneTracks.receiveShadow = true
    this.group.add(this.laneTracks)

    // Neon Track Divider Lines (4 lines separating 3 lanes)
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65,
    })

    ;[-LANE_WIDTH * 1.5, -LANE_WIDTH * 0.5, LANE_WIDTH * 0.5, LANE_WIDTH * 1.5].forEach((x) => {
      const lineGeo = new THREE.PlaneGeometry(0.06, trackLength)
      lineGeo.rotateX(-Math.PI / 2)
      const lineMesh = new THREE.Mesh(lineGeo, lineMat)
      lineMesh.position.set(x, 0.015, -trackLength / 2 + 10)
      this.group.add(lineMesh)
    })

    // 4. Conduit Pipes on Tunnel Roof
    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, trackLength, 8)
    pipeGeo.rotateX(Math.PI / 2)
    const pipeMat = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.55,
    })

    const leftPipe = new THREE.Mesh(pipeGeo, pipeMat)
    leftPipe.position.set(-3.2, 5.2, -trackLength / 2 + 10)
    this.group.add(leftPipe)

    const rightPipe = new THREE.Mesh(pipeGeo, pipeMat)
    rightPipe.position.set(3.2, 5.2, -trackLength / 2 + 10)
    this.group.add(rightPipe)

    // 5. Streaming Speed Motes
    this.particlePositions = new Float32Array(this.PARTICLE_COUNT * 3)
    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      const idx = i * 3
      this.particlePositions[idx] = (Math.random() - 0.5) * 8.5
      this.particlePositions[idx + 1] = Math.random() * 5.5 + 0.2
      this.particlePositions[idx + 2] = -Math.random() * 140
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })
    this.speedParticles = new THREE.Points(particleGeo, particleMat)
    this.group.add(this.speedParticles)
  }

  public update(delta: number, speed: number): void {
    const forwardStep = speed * delta

    // 1. Recycle Ring Arches
    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i]
      ring.position.z += forwardStep

      // When a ring passes the camera (+12), wrap it back to the far end
      if (ring.position.z > 12) {
        ring.position.z -= this.TUNNEL_LENGTH
      }
    }

    // 2. Stream Speed Motes
    const pos = this.speedParticles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      const iz = i * 3 + 2
      pos[iz] += forwardStep * 1.35 // Move slightly faster than tunnel for velocity sensation
      if (pos[iz] > 12) {
        pos[iz] = -140 + Math.random() * 10
        pos[iz - 2] = (Math.random() - 0.5) * 8.5
        pos[iz - 1] = Math.random() * 5.5 + 0.2
      }
    }
    this.speedParticles.geometry.attributes.position.needsUpdate = true
  }

  public reset(): void {
    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i]
      ring.position.z = 10 - i * this.RING_SPACING
    }
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh || (child as THREE.Points).isPoints) {
        const obj = child as THREE.Mesh
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose())
        } else {
          obj.material.dispose()
        }
      }
    })
    this.rings = []
    this.group.clear()
  }
}
