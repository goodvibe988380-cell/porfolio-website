import * as THREE from 'three'

export class AvatarLighting {
  public group: THREE.Group

  private keyLight: THREE.DirectionalLight
  private fillLight: THREE.DirectionalLight
  private cyanRimLight: THREE.DirectionalLight
  private violetRimLight: THREE.DirectionalLight
  private ambientLight: THREE.AmbientLight
  private groundLight: THREE.PointLight

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'AvatarLightingRig'

    // 1. Key Light (Crisp portrait illumination on face)
    this.keyLight = new THREE.DirectionalLight(0xfff8f0, 1.9)
    this.keyLight.position.set(0.8, 0.8, 1.3)
    this.group.add(this.keyLight)

    // 2. Fill Light (Soft cool contrast on shadow side)
    this.fillLight = new THREE.DirectionalLight(0x90b0e0, 1.0)
    this.fillLight.position.set(-1.0, 0.5, 1.1)
    this.group.add(this.fillLight)

    // 3. Cyber Cyan Rim Light (Highlighting hair silhouette & cheekbone)
    this.cyanRimLight = new THREE.DirectionalLight(0x00f0ff, 3.6)
    this.cyanRimLight.position.set(1.4, 0.8, -1.2)
    this.group.add(this.cyanRimLight)

    // 4. Violet Cinematic Rim Light (Opposite rim for rich depth)
    this.violetRimLight = new THREE.DirectionalLight(0x9d4edd, 2.6)
    this.violetRimLight.position.set(-1.4, 0.6, -1.2)
    this.group.add(this.violetRimLight)

    // 5. Ambient Fill
    this.ambientLight = new THREE.AmbientLight(0x181c28, 1.5)
    this.group.add(this.ambientLight)

    // 6. Subtle Collar Accent Light
    this.groundLight = new THREE.PointLight(0x00d4ff, 1.6, 2.5)
    this.groundLight.position.set(0, -0.32, 0.35)
    this.group.add(this.groundLight)
  }

  public update(pulse: number, energyLevel: number): void {
    // Dynamic response to touch, cursor and emotional AI states
    this.cyanRimLight.intensity = 3.6 * energyLevel + pulse * 2.2
    this.groundLight.intensity = 1.6 * energyLevel + pulse * 2.5
    this.violetRimLight.intensity = 2.6 * energyLevel + pulse * 1.5
  }

  public setPointerLighting(px: number, py: number): void {
    // Subtle responsive shift of key light towards attention target
    this.keyLight.position.x = 0.8 + px * 0.25
    this.keyLight.position.y = 0.8 + py * 0.2
  }
}
