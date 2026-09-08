import * as THREE from 'three'
import { ARCHITECTURE_STEPS, type ArchitectureStepId } from '../types'

interface Conduit {
  id: string
  fromId: ArchitectureStepId
  toId: string
  curve: THREE.CatmullRomCurve3
  tubeMesh: THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>
  active: boolean
  activeColor: THREE.Color
  particles: { progress: number; speed: number }[]
}

export class EnergyConduitsManager {
  public group: THREE.Group
  private conduits: Conduit[] = []
  private particlesMesh: THREE.InstancedMesh
  private dummy = new THREE.Object3D()
  private maxParticles = 120

  constructor() {
    this.group = new THREE.Group()
    this.buildConduits()

    // Instanced mesh for flowing energy particles
    const particleGeo = new THREE.SphereGeometry(0.055, 8, 8)
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    })
    this.particlesMesh = new THREE.InstancedMesh(particleGeo, particleMat, this.maxParticles)
    this.particlesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    if (this.particlesMesh.instanceColor) {
      this.particlesMesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
    }
    this.group.add(this.particlesMesh)
  }

  private buildConduits() {
    const nodeMap = new Map(ARCHITECTURE_STEPS.map((s) => [s.id, new THREE.Vector3(...s.position)]))
    const corePos = new THREE.Vector3(0, -0.1, 0)

    // 1. Inter-node pipeline conduits
    ARCHITECTURE_STEPS.forEach((fromNode) => {
      const p1 = nodeMap.get(fromNode.id)
      if (!p1) return
      const activeColor = new THREE.Color(fromNode.activeColor)

      fromNode.connectionsTo.forEach((toId) => {
        const p2 = nodeMap.get(toId)
        if (!p2) return

        // 3D curved spline between adjacent nodes
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
        // Give the arch a slight upward/forward curvature
        midPoint.y += 0.4
        midPoint.z += 0.35

        const curve = new THREE.CatmullRomCurve3([p1, midPoint, p2])
        const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.024, 8, false)
        const tubeMat = new THREE.MeshStandardMaterial({
          color: 0x071b2d,
          emissive: 0x0284c7,
          emissiveIntensity: 0.2,
          roughness: 0.2,
          metalness: 0.9,
          transparent: true,
          opacity: 0.45,
        })

        const mesh = new THREE.Mesh(tubeGeo, tubeMat)
        this.group.add(mesh)

        const particles = Array.from({ length: 8 }).map((_, i) => ({
          progress: i / 8,
          speed: 0.32 + Math.random() * 0.18,
        }))

        this.conduits.push({
          id: `${fromNode.id}->${toId}`,
          fromId: fromNode.id,
          toId,
          curve,
          tubeMesh: mesh,
          active: false,
          activeColor,
          particles,
        })
      })

      // 2. Direct conduit from each node into the central AI Core
      const coreMid = new THREE.Vector3().addVectors(p1, corePos).multiplyScalar(0.5)
      coreMid.z -= 0.2
      const coreCurve = new THREE.CatmullRomCurve3([p1, coreMid, corePos])
      const coreTubeGeo = new THREE.TubeGeometry(coreCurve, 24, 0.016, 6, false)
      const coreTubeMat = new THREE.MeshStandardMaterial({
        color: 0x071b2d,
        emissive: 0x0284c7,
        emissiveIntensity: 0.15,
        roughness: 0.3,
        metalness: 0.9,
        transparent: true,
        opacity: 0.25,
      })
      const coreMesh = new THREE.Mesh(coreTubeGeo, coreTubeMat)
      this.group.add(coreMesh)

      const coreParticles = Array.from({ length: 5 }).map((_, i) => ({
        progress: i / 5,
        speed: 0.38 + Math.random() * 0.2,
      }))

      this.conduits.push({
        id: `${fromNode.id}->CORE`,
        fromId: fromNode.id,
        toId: 'CORE',
        curve: coreCurve,
        tubeMesh: coreMesh,
        active: false,
        activeColor,
        particles: coreParticles,
      })
    })
  }

  /** Activate conduits when source node is connected */
  public setConduitActive(fromId: ArchitectureStepId, toId: ArchitectureStepId, active: boolean) {
    // Activate direct inter-node conduit
    const interConduit = this.conduits.find((c) => c.fromId === fromId && c.toId === toId)
    if (interConduit) {
      this.applyConduitState(interConduit, active)
    }

    // Also activate core link conduit when node powers up
    const coreConduit = this.conduits.find((c) => c.fromId === fromId && c.toId === 'CORE')
    if (coreConduit) {
      this.applyConduitState(coreConduit, active)
    }
  }

  private applyConduitState(conduit: Conduit, active: boolean) {
    conduit.active = active
    const mat = conduit.tubeMesh.material
    if (active) {
      mat.color.copy(conduit.activeColor)
      mat.emissive.copy(conduit.activeColor)
      mat.emissiveIntensity = 1.4
      mat.opacity = 0.95
    } else {
      mat.color.set(0x071b2d)
      mat.emissive.set(0x0284c7)
      mat.emissiveIntensity = 0.2
      mat.opacity = 0.35
    }
  }

  /** Activate all conduits during completion sequence */
  public activateAll() {
    this.conduits.forEach((c) => this.applyConduitState(c, true))
  }

  /** Update energy flow along curves */
  public update(delta: number, reducedMotion = false) {
    let index = 0

    this.conduits.forEach((conduit) => {
      if (!conduit.active) {
        // Inactive conduit: position particles off-screen
        conduit.particles.forEach(() => {
          if (index < this.maxParticles) {
            this.dummy.position.set(0, -999, 0)
            this.dummy.scale.set(0, 0, 0)
            this.dummy.updateMatrix()
            this.particlesMesh.setMatrixAt(index, this.dummy.matrix)
            index++
          }
        })
        return
      }

      conduit.particles.forEach((p) => {
        if (index >= this.maxParticles) return

        if (!reducedMotion) {
          p.progress = (p.progress + delta * p.speed) % 1.0
        }

        const point = conduit.curve.getPointAt(p.progress)
        this.dummy.position.copy(point)

        // Pulsing scale as it travels
        const pulse = 1.1 + Math.sin(p.progress * Math.PI) * 0.55
        this.dummy.scale.set(pulse, pulse, pulse)
        this.dummy.updateMatrix()

        this.particlesMesh.setMatrixAt(index, this.dummy.matrix)
        this.particlesMesh.setColorAt(index, conduit.activeColor)
        index++
      })
    })

    // Fill remaining unused slots off-screen
    while (index < this.maxParticles) {
      this.dummy.position.set(0, -999, 0)
      this.dummy.scale.set(0, 0, 0)
      this.dummy.updateMatrix()
      this.particlesMesh.setMatrixAt(index, this.dummy.matrix)
      index++
    }

    this.particlesMesh.instanceMatrix.needsUpdate = true
    if (this.particlesMesh.instanceColor) {
      this.particlesMesh.instanceColor.needsUpdate = true
    }
  }

  public dispose() {
    this.conduits.forEach((c) => {
      c.tubeMesh.geometry.dispose()
      c.tubeMesh.material.dispose()
    })
    this.conduits = []
    this.particlesMesh.geometry.dispose()
    ;(this.particlesMesh.material as THREE.Material).dispose()
  }
}
