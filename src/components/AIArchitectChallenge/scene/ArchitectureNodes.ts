import * as THREE from 'three'
import { ARCHITECTURE_STEPS, type ArchitectureStepId, type ArchitectureNodeConfig } from '../types'

export interface NodeMeshWrapper {
  config: ArchitectureNodeConfig
  group: THREE.Group
  mainMesh: THREE.Mesh
  wireframeMesh: THREE.LineSegments
  labelSprite: THREE.Sprite
  status: 'inactive' | 'next' | 'active'
  isHovered: boolean
  shakeTimer: number
  pulseTimer: number
  basePos: THREE.Vector3
}

export class ArchitectureNodesManager {
  public group: THREE.Group
  public nodeWrappers: Map<ArchitectureStepId, NodeMeshWrapper> = new Map()
  public raycastMeshes: THREE.Mesh[] = []

  constructor() {
    this.group = new THREE.Group()
    this.buildNodes()
  }

  private createLabelTexture(
    label: string,
    status: 'inactive' | 'next' | 'active',
    stepNum: number,
    activeColorHex: string = '#00f0ff'
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 88
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const isAct = status === 'active'
    const isNext = status === 'next'

    // Background pill badge
    ctx.fillStyle = isAct
      ? 'rgba(7, 24, 48, 0.85)'
      : isNext
      ? 'rgba(40, 16, 60, 0.85)'
      : 'rgba(8, 14, 28, 0.72)'

    ctx.strokeStyle = isAct
      ? activeColorHex
      : isNext
      ? '#f43f5e'
      : 'rgba(255, 255, 255, 0.22)'

    ctx.lineWidth = isAct ? 3.5 : isNext ? 3 : 2
    const r = 24
    ctx.beginPath()
    ctx.roundRect(6, 6, canvas.width - 12, canvas.height - 12, r)
    ctx.fill()
    ctx.stroke()

    // Inner glow shadow on active or next
    if (isAct || isNext) {
      ctx.shadowColor = isAct ? activeColorHex : '#f43f5e'
      ctx.shadowBlur = 14
    }

    // Status Dot / Checkmark
    ctx.font = 'bold 26px "DM Mono", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    if (isAct) {
      ctx.fillStyle = activeColorHex
      ctx.fillText(`✓ ${label}`, canvas.width / 2, canvas.height / 2 + 2)
    } else if (isNext) {
      ctx.fillStyle = '#ffffff'
      ctx.fillText(`0${stepNum} ${label} ●`, canvas.width / 2, canvas.height / 2 + 2)
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
      ctx.fillText(`0${stepNum} ${label}`, canvas.width / 2, canvas.height / 2 + 2)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    return texture
  }

  private buildNodes() {
    ARCHITECTURE_STEPS.forEach((cfg) => {
      const nodeGroup = new THREE.Group()
      const basePos = new THREE.Vector3(...cfg.position)
      nodeGroup.position.copy(basePos)

      // 1. Geometry based on config
      let geo: THREE.BufferGeometry
      switch (cfg.geometryType) {
        case 'cylinder':
          geo = new THREE.CylinderGeometry(0.42, 0.42, 0.42, 8)
          break
        case 'box':
          geo = new THREE.BoxGeometry(0.55, 0.48, 0.55)
          break
        case 'octahedron':
          geo = new THREE.OctahedronGeometry(0.48, 0)
          break
        case 'icosahedron':
        default:
          geo = new THREE.IcosahedronGeometry(0.45, 0)
          break
      }

      // Material
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.color),
        emissive: new THREE.Color(cfg.color),
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.85,
        transparent: true,
        opacity: 0.75,
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.userData = { nodeId: cfg.id }
      nodeGroup.add(mesh)
      this.raycastMeshes.push(mesh)

      // 2. Wireframe Cage
      const wireGeo = new THREE.WireframeGeometry(geo)
      const wireMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(cfg.activeColor),
        transparent: true,
        opacity: 0.5,
      })
      const wireframe = new THREE.LineSegments(wireGeo, wireMat)
      nodeGroup.add(wireframe)

      // 3. Billboard Label Sprite
      const initialStatus = cfg.stepNumber === 1 ? 'next' : 'inactive'
      const labelTex = this.createLabelTexture(cfg.label, initialStatus, cfg.stepNumber, cfg.activeColor)
      const spriteMat = new THREE.SpriteMaterial({
        map: labelTex,
        transparent: true,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.scale.set(1.65, 0.48, 1)
      sprite.position.set(0, 0.72, 0)
      nodeGroup.add(sprite)

      this.group.add(nodeGroup)

      this.nodeWrappers.set(cfg.id, {
        config: cfg,
        group: nodeGroup,
        mainMesh: mesh,
        wireframeMesh: wireframe,
        labelSprite: sprite,
        status: initialStatus,
        isHovered: false,
        shakeTimer: 0,
        pulseTimer: 0,
        basePos,
      })
    })
  }

  /** Update active / next / inactive states */
  public setNodeStatus(id: ArchitectureStepId, status: 'inactive' | 'next' | 'active') {
    const node = this.nodeWrappers.get(id)
    if (!node) return

    node.status = status
    const isAct = status === 'active'
    const isNext = status === 'next'

    const mat = node.mainMesh.material as THREE.MeshStandardMaterial
    const wireMat = node.wireframeMesh.material as THREE.LineBasicMaterial

    if (isAct) {
      mat.color.set(node.config.activeColor)
      mat.emissive.set(node.config.activeColor)
      mat.emissiveIntensity = 1.4
      mat.opacity = 0.98
      wireMat.color.set(node.config.activeColor)
      wireMat.opacity = 1.0
    } else if (isNext) {
      mat.color.set('#ec4899')
      mat.emissive.set('#f43f5e')
      mat.emissiveIntensity = 1.1
      mat.opacity = 0.88
      wireMat.color.set('#fb7185')
      wireMat.opacity = 0.9
    } else {
      mat.color.set(node.config.color)
      mat.emissive.set(node.config.color)
      mat.emissiveIntensity = 0.35
      mat.opacity = 0.65
      wireMat.color.set(node.config.color)
      wireMat.opacity = 0.45
    }

    // Refresh billboard label with matching color
    const newTex = this.createLabelTexture(node.config.label, status, node.config.stepNumber, node.config.activeColor)
    const oldTex = node.labelSprite.material.map
    node.labelSprite.material.map = newTex
    oldTex?.dispose()
  }

  /** Trigger subtle red wobble when wrong node clicked */
  public triggerWrongWobble(id: ArchitectureStepId) {
    const node = this.nodeWrappers.get(id)
    if (!node) return
    node.shakeTimer = 0.45

    const mat = node.mainMesh.material as THREE.MeshStandardMaterial
    mat.emissive.set(0xff0055)
    mat.emissiveIntensity = 2.0

    setTimeout(() => {
      this.setNodeStatus(id, node.status)
    }, 450)
  }

  /** Hover handling */
  public setHoveredNode(id: ArchitectureStepId | null) {
    this.nodeWrappers.forEach((node, nodeId) => {
      const hovered = nodeId === id
      if (node.isHovered !== hovered) {
        node.isHovered = hovered
        const mat = node.mainMesh.material as THREE.MeshStandardMaterial
        if (hovered) {
          mat.emissiveIntensity += 0.5
        } else {
          this.setNodeStatus(nodeId, node.status)
        }
      }
    })
  }

  /** Frame animation update */
  public update(delta: number, reducedMotion = false) {
    this.nodeWrappers.forEach((node) => {
      node.pulseTimer += delta

      // Hover and pulse scaling
      const isNext = node.status === 'next'
      const isAct = node.status === 'active'

      let targetScale = 1.0
      if (node.isHovered) {
        targetScale = 1.22
      } else if (isNext) {
        targetScale = 1.0 + Math.sin(node.pulseTimer * 4.5) * 0.09
      } else if (isAct) {
        targetScale = 1.0 + Math.sin(node.pulseTimer * 2.0) * 0.04
      }

      node.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15)

      // Subtle 3D floating and rotation
      if (!reducedMotion) {
        node.mainMesh.rotation.y += delta * (isAct ? 0.9 : 0.4)
        node.mainMesh.rotation.x += delta * 0.3
        node.wireframeMesh.rotation.copy(node.mainMesh.rotation)

        // Float gently on Z
        const floatY = Math.sin(node.pulseTimer * 1.8 + node.config.stepNumber) * 0.06
        node.group.position.y = node.basePos.y + floatY
      }

      // Shake animation if wrong action triggered
      if (node.shakeTimer > 0) {
        node.shakeTimer -= delta
        const shakeX = (Math.random() - 0.5) * 0.2
        const shakeY = (Math.random() - 0.5) * 0.2
        node.group.position.x = node.basePos.x + shakeX
        node.group.position.y = node.basePos.y + shakeY
      } else if (!reducedMotion) {
        node.group.position.x = node.basePos.x
      }
    })
  }

  public dispose() {
    this.nodeWrappers.forEach((node) => {
      node.mainMesh.geometry.dispose()
      ;(node.mainMesh.material as THREE.Material).dispose()
      node.wireframeMesh.geometry.dispose()
      ;(node.wireframeMesh.material as THREE.Material).dispose()
      node.labelSprite.geometry.dispose()
      node.labelSprite.material.map?.dispose()
      node.labelSprite.material.dispose()
    })
    this.nodeWrappers.clear()
    this.raycastMeshes = []
  }
}
