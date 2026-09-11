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

    // 1. Key Light (Crisp portrait illumination on face & shoulders)
    this.keyLight = new THREE.DirectionalLight(0xfff8f0, 1.8)
    this.keyLight.position.set(1.4, 2.6, 2.2)
    this.group.add(this.keyLight)

    // 2. Fill Light (Soft cool contrast on shadow side)
    this.fillLight = new THREE.DirectionalLight(0x90b0e0, 0.9)
    this.fillLight.position.set(-1.8, 1.4, 1.6)
    this.group.add(this.fillLight)

    // 3. Cyber Cyan Rim Light (Matching Santhosh's glowing jacket piping)
    this.cyanRimLight = new THREE.DirectionalLight(0x00f0ff, 3.8)
    this.cyanRimLight.position.set(2.4, 2.0, -2.0)
    this.group.add(this.cyanRimLight)

    // 4. Violet Cinematic Rim Light (Opposite rim for rich depth)
    this.violetRimLight = new THREE.DirectionalLight(0x9d4edd, 2.8)
    this.violetRimLight.position.set(-2.4, 1.8, -2.0)
    this.group.add(this.violetRimLight)

    // 5. Ambient Fill
    this.ambientLight = new THREE.AmbientLight(0x181c28, 1.4)
    this.group.add(this.ambientLight)

    // 6. Ground Cyber Floor Light (illuminating sneakers and floor ring)
    this.groundLight = new THREE.PointLight(0x00d4ff, 1.8, 4.0)
    this.groundLight.position.set(0, -0.85, 0.4)
    this.group.add(this.groundLight)
  }

  public update(pulse: number, energyLevel: number): void {
    // Dynamic response to touch, cursor and emotional AI states
    this.cyanRimLight.intensity = 3.8 * energyLevel + pulse * 2.5
    this.groundLight.intensity = 1.8 * energyLevel + pulse * 3.0
    this.violetRimLight.intensity = 2.8 * energyLevel + pulse * 1.5
  }

  public setPointerLighting(px: number, py: number): void {
    // Subtle responsive shift of key light towards attention target
    this.keyLight.position.x = 1.4 + px * 0.4
    this.keyLight.position.y = 2.6 + py * 0.3
  }
}
