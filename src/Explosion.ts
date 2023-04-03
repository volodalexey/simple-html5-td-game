import { AnimatedSprite, type Texture } from 'pixi.js'

export interface IExplosionOptions {
  textures: Texture[]
}

export class Explosion extends AnimatedSprite {
  static options = {
    animationSpeed: 0.5
  }

  constructor ({ textures }: IExplosionOptions) {
    super(textures)
    this.anchor.set(0.5, 0.5)
    this.animationSpeed = Explosion.options.animationSpeed
    this.loop = false
    this.play()
  }
}
