import { AnimatedSprite, Container, type Texture } from 'pixi.js'
import { Projectile } from './Projectile'
import { type Enemy } from './Enemy'
import { logBuilding } from './logger'

export interface IBuildingOptions {
  buildingTextures: Texture[]
  projectileTexture: Texture
  cell: number
}

export class Building extends AnimatedSprite {
  public elapsedFrames = 0
  public target?: Enemy
  public projectiles = new Container<Projectile>()
  public projectileTexture!: IBuildingOptions['projectileTexture']
  public cell!: IBuildingOptions['cell']
  static options = {
    attackRadius: 250,
    framesHold: 3,
    shootFrame: 6,
    spawnProjectileX: 60,
    spawnProjectileY: -60
  }

  constructor (options: IBuildingOptions) {
    super(options.buildingTextures)
    this.cell = options.cell
    this.projectileTexture = options.projectileTexture

    this.addChild(this.projectiles)
  }

  setTarget (target?: Enemy): void {
    this.target = target
  }

  handleUpdate (): void {
    this.elapsedFrames++
    const newFrame = this.elapsedFrames % Building.options.framesHold === 0
    if (this.target != null || (this.target == null && this.currentFrame !== 0)) {
      if (newFrame) {
        if (this.currentFrame >= this.totalFrames - 1) {
          this.currentFrame = 0
        } else {
          this.currentFrame++
        }
      }
    }

    if (
      (this.target != null) &&
      this.currentFrame === Building.options.shootFrame &&
      newFrame
    ) {
      this.shoot(this.target)
    }
  }

  getCenter (): {
    cx: number
    cy: number
  } {
    return {
      cx: this.x + this.cell,
      cy: this.y + this.cell / 2
    }
  }

  shoot (target: Enemy): void {
    const projectile = new Projectile({
      texture: this.projectileTexture,
      target
    })
    projectile.anchor.set(0.5, 0.5)
    logBuilding(this.x, this.y)
    projectile.position.set(Building.options.spawnProjectileX, Building.options.spawnProjectileY)
    this.projectiles.addChild(projectile)

    projectile.calcVelocity()
  }
}
