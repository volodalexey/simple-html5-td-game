import { AnimatedSprite, Graphics, type Texture } from 'pixi.js'
import { logExplosion } from './logger'
import { type IPolylinePoint } from './LoaderScene'

export interface IExplosionOptions {
  textures: Texture[]
  waypoints: IPolylinePoint[]
}

export class Explosion extends AnimatedSprite {
  static options = {
    animationSpeed: 0.5
  }

  constructor ({ textures, waypoints }: IExplosionOptions) {
    super(textures)
    this.anchor.set(0.5, 0.5)
    if (logExplosion.enabled) {
      const texture = textures[0]
      const graphics = new Graphics()
      graphics.beginFill()
      graphics.drawRect(-texture.width / 2, -texture.height / 2, texture.width, texture.height)
      graphics.endFill()
      graphics.alpha = 0.5
      this.addChild(graphics)
    }

    this.animationSpeed = Explosion.options.animationSpeed
    this.play()
  }
}
