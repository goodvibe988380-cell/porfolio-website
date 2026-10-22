import * as THREE from 'three'
import {
  LANE_POSITIONS,
  type LaneIndex,
  type ObstacleItem,
  type ObstacleType,
} from '../types'
import { HovercraftMesh } from './HovercraftMesh'

/**
 * ObstacleManager — High-Performance Pooled 3D Obstacle System
 * Manages pre-allocated laser gates, cyber firewall blocks, and quantum mines.
 * Never creates new meshes in the animation loop.
 */
export class ObstacleManager {
  public group: THREE.Group
  private pool: ObstacleItem[] = []
  private readonly POOL_SIZE = 24

  // Spawning tracking
  private lastSpawnZ = -30
  private spawnInterval = 24 // Distance in meters between obstacle waves

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'ObstacleGroup'
    this.initPool()
  }

  private initPool(): void {
    // Shared Materials
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x121724,
      metalness: 0.9,
      roughness: 0.25,
    })

    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      transparent: true,
      opacity: 0.9,
    })

    const blockGlowMat = new THREE.MeshStandardMaterial({
      color: 0x220515,
      emissive: 0xff0055,
      emissiveIntensity: 1.4,
      metalness: 0.8,
      roughness: 0.3,
    })

    const mineMat = new THREE.MeshStandardMaterial({
      color: 0x1a0520,
      emissive: 0xa855f7,
      emissiveIntensity: 1.8,
      metalness: 0.8,
      roughness: 0.2,
    })

    for (let i = 0; i < this.POOL_SIZE; i++) {
      const type: ObstacleType =
        i % 3 === 0 ? 'LASER_GATE' : i % 3 === 1 ? 'CYBER_BLOCK' : 'SPIKE_MINE'

      const mesh = new THREE.Group()
      mesh.name = `Obstacle_${i}_${type}`

      let jumpable = false

      if (type === 'LASER_GATE') {
        jumpable = true // Jumpable with hovercraft jump!

        // Two side pylons
        const pylonGeo = new THREE.CylinderGeometry(0.12, 0.15, 1.4, 8)
        const leftPylon = new THREE.Mesh(pylonGeo, metalMat)
        leftPylon.position.set(-0.95, 0.7, 0)
        mesh.add(leftPylon)

        const rightPylon = new THREE.Mesh(pylonGeo, metalMat)
        rightPylon.position.set(0.95, 0.7, 0)
        mesh.add(rightPylon)

        // Low crackling laser beam (jumpable)
        const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.9, 8)
        beamGeo.rotateZ(Math.PI / 2)
        const laserBeam = new THREE.Mesh(beamGeo, laserMat)
        laserBeam.position.set(0, 0.55, 0)
        mesh.add(laserBeam)

        // Warning light caps
        const capGeo = new THREE.SphereGeometry(0.12, 8, 8)
        const leftCap = new THREE.Mesh(capGeo, laserMat)
        leftCap.position.set(-0.95, 1.4, 0)
        mesh.add(leftCap)

        const rightCap = new THREE.Mesh(capGeo, laserMat)
        rightCap.position.set(0.95, 1.4, 0)
        mesh.add(rightCap)
      } else if (type === 'CYBER_BLOCK') {
        jumpable = false // Full barrier (must change lane)

        const blockGeo = new THREE.BoxGeometry(1.9, 2.2, 0.85)
        const blockMesh = new THREE.Mesh(blockGeo, blockGlowMat)
        blockMesh.position.set(0, 1.1, 0)
        mesh.add(blockMesh)

        // Neon outline trim
        const trimGeo = new THREE.BoxGeometry(1.96, 0.08, 0.9)
        const trimMesh = new THREE.Mesh(trimGeo, laserMat)
        trimMesh.position.set(0, 2.15, 0)
        mesh.add(trimMesh)
      } else {
        // SPIKE_MINE (Quantum Spike Hazard)
        jumpable = false

        const coreGeo = new THREE.DodecahedronGeometry(0.55, 1)
        const coreMesh = new THREE.Mesh(coreGeo, mineMat)
        coreMesh.position.set(0, 0.8, 0)
        mesh.add(coreMesh)

        // Spikes
        const spikeGeo = new THREE.ConeGeometry(0.12, 0.5, 6)
        ;[
          [0, 1, 0, 0],
          [0, -1, 0, Math.PI],
          [1, 0, 0, -Math.PI / 2],
          [-1, 0, 0, Math.PI / 2],
          [0, 0, 1, Math.PI / 2],
          [0, 0, -1, -Math.PI / 2],
        ].forEach(([x, y, z, rot]) => {
          const spike = new THREE.Mesh(spikeGeo, metalMat)
          spike.position.set(x * 0.45, 0.8 + y * 0.45, z * 0.45)
          spike.rotation.z = rot
          mesh.add(spike)
        })
      }

      mesh.visible = false
      this.group.add(mesh)

      this.pool.push({
        id: i,
        type,
        lane: 0,
        mesh,
        z: -999,
        active: false,
        passed: false,
        box: new THREE.Box3(),
        jumpable,
      })
    }
  }

  public update(
    delta: number,
    speed: number,
    playerDistance: number,
    craft: HovercraftMesh
  ): boolean {
    const forwardStep = speed * delta
    let collisionDetected = false

    // 1. Move Active Obstacles Towards Player (Z increases)
    for (const item of this.pool) {
      if (!item.active) continue

      item.z += forwardStep
      item.mesh.position.z = item.z

      // Subtle rotation on mines
      if (item.type === 'SPIKE_MINE') {
        item.mesh.rotation.y += delta * 1.5
        item.mesh.rotation.x += delta * 0.8
      }

      // Update collision bounding box
      item.box.setFromObject(item.mesh)

      // Collision Check against Hovercraft
      if (item.z > -2.5 && item.z < 2.5) {
        if (craft.boundingBox.intersectsBox(item.box)) {
          // If hurdle is jumpable and craft is jumping high enough, clear safely!
          if (item.jumpable && craft.currentY > 1.4) {
            // Jumped over successfully!
          } else {
            collisionDetected = true
          }
        }
      }

      // Mark as passed when behind craft
      if (item.z > 3.0 && !item.passed) {
        item.passed = true
      }

      // Recycle obstacle once past camera
      if (item.z > 14.0) {
        this.deactivate(item)
      }
    }

    // 2. Spawn New Waves Ahead
    this.spawnInterval = Math.max(14, 26 - (playerDistance / 1000) * 8)
    if (this.lastSpawnZ > -120 + this.spawnInterval) {
      this.spawnWave(playerDistance)
    } else {
      this.lastSpawnZ += forwardStep
    }

    return collisionDetected
  }

  private spawnWave(distance: number): void {
    const lanes: LaneIndex[] = [-1, 0, 1]

    // Difficulty scaling:
    // < 150m: single obstacle
    // 150m - 500m: 1 or 2 obstacles (always leave 1 lane completely free or 1 jumpable)
    // > 500m: 2 obstacles (e.g. 1 block + 1 laser gate)
    let obstaclesToSpawn = 1
    if (distance > 500 && Math.random() < 0.65) {
      obstaclesToSpawn = 2
    } else if (distance > 180 && Math.random() < 0.45) {
      obstaclesToSpawn = 2
    }

    // Shuffle lanes
    const shuffledLanes = [...lanes].sort(() => Math.random() - 0.5)
    const selectedLanes = shuffledLanes.slice(0, obstaclesToSpawn)

    // Ensure at least one lane is safe or jumpable
    const types: ObstacleType[] = ['LASER_GATE', 'CYBER_BLOCK', 'SPIKE_MINE']

    selectedLanes.forEach((lane, idx) => {
      const available = this.pool.find((item) => !item.active)
      if (!available) return

      // Pick type
      let chosenType: ObstacleType = types[Math.floor(Math.random() * types.length)]
      if (obstaclesToSpawn === 2 && idx === 1 && chosenType === 'CYBER_BLOCK') {
        // If two obstacles in a wave, make second one a jumpable laser gate to prevent dead-ends
        chosenType = 'LASER_GATE'
      }

      this.activate(available, chosenType, lane, -115)
    })

    this.lastSpawnZ = -115
  }

  private activate(
    item: ObstacleItem,
    _type: ObstacleType,
    lane: LaneIndex,
    z: number
  ): void {
    item.active = true
    item.passed = false
    item.lane = lane
    item.z = z

    item.mesh.position.set(LANE_POSITIONS[lane], 0, z)
    item.mesh.visible = true
  }

  private deactivate(item: ObstacleItem): void {
    item.active = false
    item.passed = false
    item.mesh.visible = false
    item.z = -999
  }

  public reset(): void {
    for (const item of this.pool) {
      this.deactivate(item)
    }
    this.lastSpawnZ = -30
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.geometry.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose())
        } else {
          mesh.material.dispose()
        }
      }
    })
    this.pool = []
    this.group.clear()
  }
}
