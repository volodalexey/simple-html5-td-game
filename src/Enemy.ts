import { AnimatedSprite, Graphics, type Texture } from 'pixi.js'
import { logEnemy } from './logger'
import { type IPolylinePoint } from './LoaderScene'

export interface IEnemyOptions {
  textures: Texture[]
  waypoints: IPolylinePoint[]
}

export class Enemy extends AnimatedSprite {
  public waypoints!: IPolylinePoint[]
  public waypointIndex = 2
  public velocity = {
    vx: 0,
    vy: 0
  }

  static options = {
    moveSpeed: 3,
    animationSpeed: 0.5
  }

  constructor ({ textures, waypoints }: IEnemyOptions) {
    super(textures)
    this.waypoints = waypoints
    this.anchor.set(0.5, 0.5)
    if (logEnemy.enabled) {
      const texture = textures[0]
      const graphics = new Graphics()
      graphics.beginFill()
      graphics.drawRect(-texture.width / 2, -texture.height / 2, texture.width, texture.height)
      graphics.endFill()
      graphics.alpha = 0.5
      this.addChild(graphics)
    }

    this.animationSpeed = Enemy.options.animationSpeed
    this.play()
  }

  handleUpdate (): void {
    const waypoint = this.waypoints[this.waypointIndex]
    if (waypoint == null) {
      return
    }

    const yDistance = waypoint.y - this.y
    const xDistance = waypoint.x - this.x
    const angle = Math.atan2(yDistance, xDistance)

    const { moveSpeed } = Enemy.options

    this.velocity.vx = Math.cos(angle) * moveSpeed
    this.velocity.vy = Math.sin(angle) * moveSpeed

    logEnemy(`ePosX=${this.position.x} ePosY=${this.position.y} eVX=${this.velocity.vx} eVY=${this.velocity.vy}`)
    this.position.x += this.velocity.vx
    this.position.y += this.velocity.vy

    const distance = Math.hypot(waypoint.y - this.y, waypoint.x - this.x)
    if (
      distance < moveSpeed &&
      this.waypointIndex < this.waypoints.length - 1
    ) {
      this.waypointIndex++
    }
  }
}
