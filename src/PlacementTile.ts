import { Graphics, Sprite, type Texture } from 'pixi.js'
import { logTilePlacement } from './logger'

export interface IPlacementTileOptions {
  texture: Texture
}

export class PlacementTile extends Sprite {
  constructor ({ texture }: IPlacementTileOptions) {
    super(texture)
    this.anchor.set(0, 0.5)
    if (logTilePlacement.enabled) {
      const graphics = new Graphics()
      graphics.beginFill()
      graphics.drawRect(0, -texture.height / 2, texture.width, texture.height)
      graphics.endFill()
      graphics.alpha = 0.5
      this.addChild(graphics)
    }
  }
}
