import * as THREE from 'three'
import { LANE_POSITIONS, type LaneIndex } from '../types'

/**
 * HovercraftMesh — Sleek Futuristic 3D Cyber Hovercraft
 * Custom procedural 3D model featuring aerodynamic wedge fuselage,
 * twin plasma thruster turbines, glowing aerofoil winglets, and anti-grav hover disc.
 */
export class HovercraftMesh {
  public group: THREE.Group
  public currentLane: LaneIndex = 0
  public targetX = 0
  public currentX = 0
  public currentY = 0.55 // Base hover elevation
  public velocityY = 0
  public isJumping = false

  // Thruster glow references for animation
  private leftThrusterGlow!: THREE.Mesh
  private rightThrusterGlow!: THREE.Mesh
  private hoverDisc!: THREE.Mesh
  private chassisMesh!: THREE.Mesh

  // Bounding box for precision collision detection
  public boundingBox: THREE.Box3 = new THREE.Box3()
  private collisionHelperBox: THREE.Box3 = new THREE.Box3()

  // Constants
  public readonly BASE_Y = 0.55
  public readonly JUMP_FORCE = 11.5
  public readonly GRAVITY = 32.0

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'NeonHovercraft'
    this.buildCraft()
    this.updateBounds()
  }

  private buildCraft(): void {
    // 1. Futuristic Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1a,
      metalness: 0.92,
      roughness: 0.22,
    })

    const accentCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
      metalness: 0.5,
      roughness: 0.2,
    })

    const accentMagentaMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 1.8,
      metalness: 0.5,
      roughness: 0.2,
    })

    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x001a33,
      metalness: 0.98,
      roughness: 0.08,
      transparent: true,
      opacity: 0.88,
    })

    const thrusterPlasmaMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.85,
    })

    // 2. Central Fuselage (Aerodynamic Wedge)
    const bodyGeo = new THREE.ConeGeometry(0.75, 2.2, 5)
    bodyGeo.rotateX(Math.PI / 2)
    bodyGeo.scale(1.2, 0.45, 1.0)
    this.chassisMesh = new THREE.Mesh(bodyGeo, chassisMat)
    this.chassisMesh.castShadow = true
    this.group.add(this.chassisMesh)

    // 3. Cockpit Canopy
    const canopyGeo = new THREE.SphereGeometry(0.38, 16, 12)
    canopyGeo.scale(0.85, 0.48, 1.4)
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat)
    canopyMesh.position.set(0, 0.16, -0.05)
    this.group.add(canopyMesh)

    // 4. Swept Cyber Wings (Left & Right)
    const wingShape = new THREE.Shape()
    wingShape.moveTo(0, 0)
    wingShape.lineTo(1.35, -0.75)
    wingShape.lineTo(1.15, -1.25)
    wingShape.lineTo(0, -0.85)
    wingShape.closePath()

    const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    })
    wingExtrude.rotateX(Math.PI / 2)

    // Right Wing
    const rightWing = new THREE.Mesh(wingExtrude, chassisMat)
    rightWing.position.set(0.25, 0.02, 0.15)
    this.group.add(rightWing)

    // Right Wing Neon Leading Edge Strip
    const wingStripGeo = new THREE.BoxGeometry(1.25, 0.04, 0.06)
    wingStripGeo.rotateY(0.48)
    const rightWingStrip = new THREE.Mesh(wingStripGeo, accentCyanMat)
    rightWingStrip.position.set(0.85, 0.05, -0.2)
    this.group.add(rightWingStrip)

    // Left Wing (Mirrored)
    const leftWing = new THREE.Mesh(wingExtrude, chassisMat)
    leftWing.scale.set(-1, 1, 1)
    leftWing.position.set(-0.25, 0.02, 0.15)
    this.group.add(leftWing)

    // Left Wing Neon Strip
    const leftWingStrip = new THREE.Mesh(wingStripGeo, accentCyanMat)
    leftWingStrip.rotation.y = -0.48
    leftWingStrip.position.set(-0.85, 0.05, -0.2)
    this.group.add(leftWingStrip)

    // 5. Twin Plasma Thruster Turbines
    const turbineGeo = new THREE.CylinderGeometry(0.16, 0.19, 0.7, 14)
    turbineGeo.rotateX(Math.PI / 2)

    const leftTurbine = new THREE.Mesh(turbineGeo, chassisMat)
    leftTurbine.position.set(-0.45, 0.04, 0.8)
    this.group.add(leftTurbine)

    const rightTurbine = new THREE.Mesh(turbineGeo, chassisMat)
    rightTurbine.position.set(0.45, 0.04, 0.8)
    this.group.add(rightTurbine)

    // Thruster Trim Rings
    const ringGeo = new THREE.TorusGeometry(0.18, 0.028, 8, 16)
    const leftRing = new THREE.Mesh(ringGeo, accentMagentaMat)
    leftRing.position.set(-0.45, 0.04, 1.15)
    this.group.add(leftRing)

    const rightRing = new THREE.Mesh(ringGeo, accentMagentaMat)
    rightRing.position.set(0.45, 0.04, 1.15)
    this.group.add(rightRing)

    // Glowing Plasma Exhaust Plumes
    const plumeGeo = new THREE.ConeGeometry(0.13, 0.65, 12)
    plumeGeo.rotateX(-Math.PI / 2)
    plumeGeo.translate(0, 0, 0.32)

    this.leftThrusterGlow = new THREE.Mesh(plumeGeo, thrusterPlasmaMat)
    this.leftThrusterGlow.position.set(-0.45, 0.04, 1.15)
    this.group.add(this.leftThrusterGlow)

    this.rightThrusterGlow = new THREE.Mesh(plumeGeo, thrusterPlasmaMat)
    this.rightThrusterGlow.position.set(0.45, 0.04, 1.15)
    this.group.add(this.rightThrusterGlow)

    // 6. Anti-Gravity Ground Projection Disc
    const discGeo = new THREE.RingGeometry(0.3, 0.85, 24)
    discGeo.rotateX(-Math.PI / 2)
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    this.hoverDisc = new THREE.Mesh(discGeo, discMat)
    this.hoverDisc.position.set(0, -0.48, 0.1)
    this.group.add(this.hoverDisc)
  }

  public setLane(lane: LaneIndex): void {
    this.currentLane = lane
    this.targetX = LANE_POSITIONS[lane]
  }

  public shiftLane(direction: -1 | 1): boolean {
    const nextLane = (this.currentLane + direction) as LaneIndex
    if (nextLane >= -1 && nextLane <= 1) {
      this.setLane(nextLane)
      return true
    }
    return false
  }

  public jump(): boolean {
    if (this.isJumping) return false
    this.isJumping = true
    this.velocityY = this.JUMP_FORCE
    return true
  }

  public update(delta: number, time: number): void {
    // 1. Smooth Spring-Damped Horizontal Lane Interpolation
    const lerpRate = Math.min(1, delta * 14)
    const prevX = this.currentX
    this.currentX += (this.targetX - this.currentX) * lerpRate
    const deltaX = this.currentX - prevX

    // 2. Vertical Jump Physics
    if (this.isJumping) {
      this.currentY += this.velocityY * delta
      this.velocityY -= this.GRAVITY * delta

      if (this.currentY <= this.BASE_Y) {
        this.currentY = this.BASE_Y
        this.velocityY = 0
        this.isJumping = false
      }
    } else {
      // Gentle floating bob when hovering
      const hoverBob = Math.sin(time * 6.5) * 0.04
      this.currentY = this.BASE_Y + hoverBob
    }

    // 3. Dynamic Banking Roll and Pitch
    // Banking into turns
    const targetRoll = -deltaX * 3.8
    this.group.rotation.z += (targetRoll - this.group.rotation.z) * Math.min(1, delta * 12)

    // Pitch upwards when jumping, slight forward tilt when diving
    const targetPitch = this.isJumping ? -this.velocityY * 0.028 : 0.04
    this.group.rotation.x += (targetPitch - this.group.rotation.x) * Math.min(1, delta * 10)

    // Slight aerodynamic yaw into turns
    this.group.rotation.y = deltaX * 0.85

    // 4. Update Craft Position
    this.group.position.set(this.currentX, this.currentY, 0)

    // 5. Animate Thruster Flames & Ground Disc
    const flicker = 1.0 + Math.sin(time * 38) * 0.22 + (this.isJumping ? 0.4 : 0)
    this.leftThrusterGlow.scale.set(1.0, 1.0, flicker)
    this.rightThrusterGlow.scale.set(1.0, 1.0, flicker)

    // Ground disc tracks distance to floor
    const altitude = this.currentY - this.BASE_Y
    const discScale = Math.max(0.4, 1.0 - altitude * 0.28)
    this.hoverDisc.scale.set(discScale, discScale, 1.0)
    ;(this.hoverDisc.material as THREE.MeshBasicMaterial).opacity = Math.max(0.12, 0.45 - altitude * 0.15)
    this.hoverDisc.position.y = -this.currentY + 0.05 // Lock close to floor

    this.updateBounds()
  }

  public updateBounds(): void {
    // Tightly fitted collision box (slightly forgiving for satisfying gameplay)
    this.collisionHelperBox.setFromCenterAndSize(
      new THREE.Vector3(this.currentX, this.currentY, 0),
      new THREE.Vector3(1.2, 0.55, 1.6)
    )
    this.boundingBox.copy(this.collisionHelperBox)
  }

  public reset(): void {
    this.currentLane = 0
    this.targetX = 0
    this.currentX = 0
    this.currentY = this.BASE_Y
    this.velocityY = 0
    this.isJumping = false
    this.group.rotation.set(0, 0, 0)
    this.group.position.set(0, this.BASE_Y, 0)
    this.updateBounds()
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
    this.group.clear()
  }
}
