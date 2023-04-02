import { Sprite, type Texture } from 'pixi.js'

export interface IPlacementTileOptions {
  texture: Texture
}

export class PlacementTile extends Sprite {
  constructor ({ texture }: IPlacementTileOptions) {
    super(texture)
  }
}
