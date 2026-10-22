import * as THREE from 'three'

export type GameState = 'READY' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'

export type LaneIndex = -1 | 0 | 1

export const LANE_WIDTH = 2.4
export const LANE_POSITIONS: Record<LaneIndex, number> = {
  [-1]: -LANE_WIDTH,
  [0]: 0,
  [1]: LANE_WIDTH,
}

export type ObstacleType = 'LASER_GATE' | 'CYBER_BLOCK' | 'SPIKE_MINE' | 'TALL_BARRIER'

export interface ObstacleItem {
  id: number
  type: ObstacleType
  lane: LaneIndex
  mesh: THREE.Group
  z: number
  active: boolean
  passed: boolean
  box: THREE.Box3
  jumpable: boolean
}

export type CollectibleType = 'ENERGY_CORE' | 'DATA_SHARD'

export interface CollectibleItem {
  id: number
  type: CollectibleType
  lane: LaneIndex
  mesh: THREE.Group
  z: number
  active: boolean
  collected: boolean
  value: number
  box: THREE.Box3
}

export interface GameStats {
  score: number
  distance: number
  coresCollected: number
  multiplier: number
  speed: number
  energy: number
  highScore: number
}

export interface AIArchitectChallengeProps {
  onOpenContact?: (message?: string) => void
}
