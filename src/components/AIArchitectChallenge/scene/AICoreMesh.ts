import * as THREE from 'three'

export class AICoreMesh {
  public group: THREE.Group
  private innerCore: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  private outerCage: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshStandardMaterial>
  private cageWireframe: THREE.LineSegments
  private ring1: THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>
  private ring2: THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>
  private pointLight: THREE.PointLight
  
  private baseScale = 1
  private pulseTimer = 0
  private surgeLevel = 0
  private isSupernova = false

  constructor() {
    this.group = new THREE.Group()
    this.group.position.set(0, -0.1, 0)

    // 1. Inner glowing energy core
    const innerGeo = new THREE.SphereGeometry(0.55, 32, 32)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d2ff,
      emissiveIntensity: 1.2,
      roughness: 0.15,
      metalness: 0.85,
    })
    this.innerCore = new THREE.Mesh(innerGeo, innerMat)
    this.group.add(this.innerCore)

    // 2. Mid Geodesic Icosahedron Cage
    const cageGeo = new THREE.IcosahedronGeometry(0.85, 1)
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.5,
    })
    this.outerCage = new THREE.Mesh(cageGeo, cageMat)
    this.group.add(this.outerCage)

    // Wireframe edges on cage
    const wireGeo = new THREE.WireframeGeometry(cageGeo)
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      linewidth: 1.5,
    })
    this.cageWireframe = new THREE.LineSegments(wireGeo, wireMat)
    this.group.add(this.cageWireframe)

    // 3. Dual Counter-Rotating Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(1.2, 0.022, 16, 64)
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.8,
    })
    this.ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    this.ring1.rotation.x = Math.PI / 3.5
    this.ring1.rotation.y = Math.PI / 6
    this.group.add(this.ring1)

    const ringGeo2 = new THREE.TorusGeometry(1.35, 0.018, 16, 64)
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xc026d3,
      emissive: 0x9333ea,
      emissiveIntensity: 0.85,
      roughness: 0.3,
      metalness: 0.8,
    })
    this.ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    this.ring2.rotation.x = -Math.PI / 4
    this.ring2.rotation.y = -Math.PI / 5
    this.group.add(this.ring2)

    // 4. Dedicated Core Point Light
    this.pointLight = new THREE.PointLight(0x00f0ff, 2.5, 8)
    this.group.add(this.pointLight)
  }

  /** Trigger an energy surge when a node connects */
  public triggerSurge() {
    this.surgeLevel = 1.0
  }

  /** Activate full supernova mode upon 100% completion */
  public setSupernova(active: boolean) {
    this.isSupernova = active
  }

  /** Update animations every frame */
  public update(delta: number, reducedMotion = false) {
    this.pulseTimer += delta

    if (!reducedMotion) {
      // Rotation
      const spinSpeed = this.isSupernova ? 2.5 : 0.4
      this.innerCore.rotation.y += delta * spinSpeed * 0.8
      this.outerCage.rotation.y -= delta * spinSpeed * 0.5
      this.outerCage.rotation.x += delta * spinSpeed * 0.3
      this.cageWireframe.rotation.copy(this.outerCage.rotation)

      this.ring1.rotation.z += delta * (this.isSupernova ? 3.5 : 0.6)
      this.ring2.rotation.z -= delta * (this.isSupernova ? 3.0 : 0.5)
    }

    // Decay surge level
    if (this.surgeLevel > 0) {
      this.surgeLevel = Math.max(0, this.surgeLevel - delta * 1.6)
    }

    // Breathing pulse math
    const breathe = Math.sin(this.pulseTimer * 2.2) * 0.05
    const targetScale = this.isSupernova
      ? 1.25 + Math.sin(this.pulseTimer * 6) * 0.08
      : this.baseScale + breathe + this.surgeLevel * 0.22

    this.group.scale.setScalar(targetScale)

    // Emissive intensity modulation
    const intensity = this.isSupernova
      ? 2.5 + Math.sin(this.pulseTimer * 8) * 0.5
      : 1.0 + Math.sin(this.pulseTimer * 2.2) * 0.35 + this.surgeLevel * 1.5

    this.innerCore.material.emissiveIntensity = intensity
    this.pointLight.intensity = intensity * 2.2
  }

  public dispose() {
    this.innerCore.geometry.dispose()
    this.innerCore.material.dispose()
    this.outerCage.geometry.dispose()
    this.outerCage.material.dispose()
    this.cageWireframe.geometry.dispose()
    ;(this.cageWireframe.material as THREE.Material).dispose()
    this.ring1.geometry.dispose()
    this.ring1.material.dispose()
    this.ring2.geometry.dispose()
    this.ring2.material.dispose()
  }
}
