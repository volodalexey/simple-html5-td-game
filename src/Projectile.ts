import { type Texture, Sprite } from 'pixi.js'
import { type Enemy } from './Enemy'
import { logProjectile } from './logger'

export interface IProjectileOptions {
  texture: Texture
  target: Enemy
}

export class Projectile extends Sprite {
  public elapsedFrames = 0
  public target!: IProjectileOptions['target']
  static options = {
    moveSpeed: 6,
    maxFramesAlive: 200,
    radius: 10,
    damage: 20
  }

  public velocity = {
    vx: 0,
    vy: 0
  }

  constructor (options: IProjectileOptions) {
    super(options.texture)
    this.target = options.target
  }

  calcVelocity (): void {
    if (!this.target.isDead()) {
      const projectilePosition = this.getGlobalPosition()
      const targetPosition = this.target.getGlobalPosition()
      logProjectile(`x=${projectilePosition.x} y=${projectilePosition.y} tX=${targetPosition.x} tY=${targetPosition.y}`)
      const diffY = targetPosition.y - projectilePosition.y
      const diffX = targetPosition.x - projectilePosition.x

      const angle = Math.atan2(diffY, diffX)
      const { moveSpeed } = Projectile.options

      this.velocity.vx = Math.cos(angle) * moveSpeed
      this.velocity.vy = Math.sin(angle) * moveSpeed
    }
  }

  handleUpdate (): void {
    if (this.target.isDead()) {
      if (this.alpha > 0) {
        this.alpha += 0.05
      }
    }
    this.elapsedFrames++

    this.position.x += this.velocity.vx
    this.position.y += this.velocity.vy
  }

  isAlive (): boolean {
    return this.elapsedFrames <= Projectile.options.maxFramesAlive
  }
}
