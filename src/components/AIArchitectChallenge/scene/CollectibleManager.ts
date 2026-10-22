import * as THREE from 'three'
import {
  LANE_POSITIONS,
  type LaneIndex,
  type CollectibleItem,
  type CollectibleType,
} from '../types'
import { HovercraftMesh } from './HovercraftMesh'

/**
 * CollectibleManager — High-Performance Pooled Energy Cores & Data Shards
 * Manages floating, spinning glowing quantum cores that reward the player with points & energy.
 */
export class CollectibleManager {
  public group: THREE.Group
  private pool: CollectibleItem[] = []
  private readonly POOL_SIZE = 36

  private lastSpawnZ = -20

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'CollectibleGroup'
    this.initPool()
  }

  private initPool(): void {
    // 1. Shared Materials
    const coreCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.5,
      metalness: 0.2,
      roughness: 0.1,
    })

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.85,
    })

    const shardAmberMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xffb703,
      emissiveIntensity: 2.8,
      metalness: 0.3,
      roughness: 0.15,
    })

    const coreGeo = new THREE.OctahedronGeometry(0.35, 0)
    const ringGeo = new THREE.TorusGeometry(0.52, 0.035, 6, 16)
    const shardGeo = new THREE.ConeGeometry(0.32, 0.75, 4)

    for (let i = 0; i < this.POOL_SIZE; i++) {
      const isShard = i % 4 === 0
      const type: CollectibleType = isShard ? 'DATA_SHARD' : 'ENERGY_CORE'

      const mesh = new THREE.Group()
      mesh.name = `Collectible_${i}_${type}`

      if (type === 'ENERGY_CORE') {
        const coreMesh = new THREE.Mesh(coreGeo, coreCyanMat)
        mesh.add(coreMesh)

        const orbitRing = new THREE.Mesh(ringGeo, ringMat)
        orbitRing.rotation.x = Math.PI / 3
        mesh.add(orbitRing)
      } else {
        const shardMesh = new THREE.Mesh(shardGeo, shardAmberMat)
        shardMesh.rotation.z = Math.PI
        mesh.add(shardMesh)
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
        collected: false,
        value: isShard ? 250 : 100,
        box: new THREE.Box3(),
      })
    }
  }

  public update(
    delta: number,
    speed: number,
    time: number,
    craft: HovercraftMesh
  ): CollectibleItem[] {
    const forwardStep = speed * delta
    const collectedItems: CollectibleItem[] = []

    // 1. Move Active Collectibles
    for (const item of this.pool) {
      if (!item.active || item.collected) continue

      item.z += forwardStep
      item.mesh.position.z = item.z

      // Continuous dual-axis spin & subtle vertical floating bob
      item.mesh.rotation.y += delta * 3.2
      item.mesh.rotation.x += delta * 1.8
      item.mesh.position.y = 0.65 + Math.sin(time * 5.0 + item.id) * 0.1

      // Update bounding box
      item.box.setFromObject(item.mesh)

      // Collision Check with Hovercraft
      if (item.z > -2.2 && item.z < 2.2) {
        if (craft.boundingBox.intersectsBox(item.box)) {
          item.collected = true
          item.active = false
          item.mesh.visible = false
          collectedItems.push(item)
        }
      }

      // Recycle past camera
      if (item.z > 12.0) {
        this.deactivate(item)
      }
    }

    // 2. Spawn Sequences
    if (this.lastSpawnZ > -85) {
      this.spawnCluster()
    } else {
      this.lastSpawnZ += forwardStep
    }

    return collectedItems
  }

  private spawnCluster(): void {
    const lanes: LaneIndex[] = [-1, 0, 1]
    const chosenLane = lanes[Math.floor(Math.random() * lanes.length)]
    const clusterLength = Math.floor(Math.random() * 3) + 2 // 2 to 4 cores in a row

    for (let i = 0; i < clusterLength; i++) {
      const available = this.pool.find((item) => !item.active)
      if (!available) break

      const zOffset = -110 - i * 3.8
      const isShard = Math.random() < 0.25
      this.activate(available, isShard ? 'DATA_SHARD' : 'ENERGY_CORE', chosenLane, zOffset)
    }

    this.lastSpawnZ = -110 - clusterLength * 3.8
  }

  private activate(
    item: CollectibleItem,
    type: CollectibleType,
    lane: LaneIndex,
    z: number
  ): void {
    item.type = type
    item.active = true
    item.collected = false
    item.lane = lane
    item.z = z
    item.value = type === 'DATA_SHARD' ? 250 : 100

    item.mesh.position.set(LANE_POSITIONS[lane], 0.65, z)
    item.mesh.visible = true
  }

  private deactivate(item: CollectibleItem): void {
    item.active = false
    item.collected = false
    item.mesh.visible = false
    item.z = -999
  }

  public reset(): void {
    for (const item of this.pool) {
      this.deactivate(item)
    }
    this.lastSpawnZ = -20
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
