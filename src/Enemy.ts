import { AnimatedSprite, Graphics, type Texture } from 'pixi.js'
import { logEnemy } from './logger'
import { type IPolylinePoint } from './LoaderScene'
import { HealthBar } from './HealthBar'

export interface IEnemyOptions {
  textures: Texture[]
  waypoints: IPolylinePoint[]
  moveSpeed: number
}

export class Enemy extends AnimatedSprite {
  public waypoints!: IPolylinePoint[]
  public waypointIndex = 2
  public velocity = {
    vx: 0,
    vy: 0
  }

  public moveSpeed = 2

  public health = 100
  public healthBar!: HealthBar

  static options = {
    animationSpeed: 0.5,
    radius: 30,
    coinsReward: 25
  }

  constructor ({ textures, waypoints, moveSpeed }: IEnemyOptions) {
    super(textures)
    this.moveSpeed = moveSpeed
    this.waypoints = waypoints
    this.anchor.set(0.5, 0.5)
    if (logEnemy.enabled) {
      const graphics = new Graphics()
      graphics.beginFill()
      graphics.drawCircle(0, 0, Enemy.options.radius)
      graphics.endFill()
      graphics.alpha = 0.5
      this.addChild(graphics)
    }

    this.animationSpeed = Enemy.options.animationSpeed
    this.play()

    this.healthBar = new HealthBar()
    this.healthBar.position.set(-this.healthBar.width / 2, -textures[0].height / 2 - this.healthBar.height)
    this.addChild(this.healthBar)
  }

  handleUpdate (): void {
    const waypoint = this.waypoints[this.waypointIndex]
    if (waypoint == null) {
      return
    }

    const yDistance = waypoint.y - this.y
    const xDistance = waypoint.x - this.x
    const angle = Math.atan2(yDistance, xDistance)

    const { moveSpeed } = this

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

  subHealth (damage: number): void {
    this.health -= damage
    if (this.health <= 0) {
      this.health = 0
    }
    this.healthBar.setHealth(this.health / 100)
  }

  isDead (): boolean {
    return this.health <= 0
  }
}
