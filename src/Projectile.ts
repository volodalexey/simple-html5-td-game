import { type Texture, Sprite, AnimatedSprite, Container } from 'pixi.js'
import { type Enemy } from './Enemy'
import { logProjectile } from './logger'

export interface IProjectileOptions<T> {
  target: Enemy
  sprite: T
}

export class Projectile<T extends Sprite | AnimatedSprite> extends Container {
  public elapsedFrames = 0
  public target!: IProjectileOptions<T>['target']
  public sprite!: T
  public moveSpeed!: number
  public maxFramesAlive!: number
  public radius!: number
  public damage!: number
  public isFireball = false

  public velocity = {
    vx: 0,
    vy: 0
  }

  constructor (options: IProjectileOptions<T>) {
    super()
    this.sprite = options.sprite
    this.sprite.anchor.set(0.5, 0.5)
    this.target = options.target

    this.addChild(options.sprite)
  }

  calcFutureTarget (predictSteps = 1): number {
    if (!this.target.isDead()) {
      const projectilePosition = this.getGlobalPosition()
      const targetPosition = this.target.getGlobalPosition()
      for (let i = 0; i < predictSteps; i++) {
        targetPosition.x += this.target.velocity.vx
        targetPosition.y += this.target.velocity.vy
      }
      logProjectile(`x=${projectilePosition.x} y=${projectilePosition.y} tX=${targetPosition.x} tY=${targetPosition.y}`)
      const diffY = targetPosition.y - projectilePosition.y
      const diffX = targetPosition.x - projectilePosition.x

      const angle = Math.atan2(diffY, diffX)
      const { moveSpeed } = this

      this.velocity.vx = Math.cos(angle) * moveSpeed
      this.velocity.vy = Math.sin(angle) * moveSpeed
      return angle
    }
    return 0
  }

  handleUpdate (): void {
    if (this.target.isDead()) {
      if (this.alpha > 0) {
        this.alpha -= 0.05
      }
    }
    this.elapsedFrames++

    this.position.x += this.velocity.vx
    this.position.y += this.velocity.vy
  }

  isAlive (): boolean {
    return this.elapsedFrames <= this.maxFramesAlive
  }
}

export interface IStoneOptions {
  texture: Texture
  target: Enemy
}

export class Stone extends Projectile<Sprite> {
  public moveSpeed = 8
  public maxFramesAlive = 200
  public radius = 10
  public damage = 20
  public isFireball = false
  constructor (options: IStoneOptions) {
    const sprite = new Sprite(options.texture)
    super({ sprite, target: options.target })
    this.target = options.target
  }
}

export interface IFireballOptions {
  textures: Texture[]
  target: Enemy
}

export class Fireball extends Projectile<AnimatedSprite> {
  public moveSpeed = 5
  public maxFramesAlive = 300
  public radius = 10
  public damage = 30
  public isFireball = true
  constructor (options: IFireballOptions) {
    const sprite = new AnimatedSprite(options.textures)
    super({ sprite, target: options.target })
    this.target = options.target
    this.sprite.play()
  }

  handleUpdate (): void {
    const angle = this.calcFutureTarget()
    this.sprite.rotation = angle + 1

    super.handleUpdate()
  }
}
