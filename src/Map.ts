import { Container, Sprite, type Texture } from 'pixi.js'
import { type ITileLayer, type IMapSettings } from './LoaderScene'
import { PlacementTile } from './PlacementTile'

export interface IMapOptions {
  mapSettings: IMapSettings
  textures: {
    mapTexture: Texture
    towerTextures: Texture[]
    orcTextures: Texture[]
    explosionTextures: Texture[]
    projectileTexture: Texture
    placementTexture: Texture
  }
}

export class Map extends Container {
  static options = {
    tilesPerRow: 20,
    cell: 64
  }

  public backgroound!: Sprite
  public mapSettings!: IMapSettings
  public placementTiles: PlacementTile[] = []
  public textures!: IMapOptions['textures']

  constructor (options: IMapOptions) {
    super()
    this.mapSettings = options.mapSettings
    this.textures = options.textures
    this.setup()
  }

  findTileLayer (name: string): ITileLayer {
    const layer = this.mapSettings.layers.find((l): l is ITileLayer => l.type === 'tilelayer' && l.name === name)
    if (layer == null) {
      throw new Error(`Unable to detect "${name}" layer`)
    }
    return layer
  }

  setup (): void {
    const {
      placementTiles,
      textures: {
        mapTexture,
        placementTexture
      }
    } = this

    this.backgroound = new Sprite(mapTexture)
    this.addChild(this.backgroound)

    const { tilesPerRow, cell } = Map.options
    const placementTilesLayer = this.findTileLayer('Placement Tiles')

    for (let i = 0; i < placementTilesLayer.data.length; i += tilesPerRow) {
      const row = placementTilesLayer.data.slice(i, i + tilesPerRow)
      // console.log(row)
      row.forEach((symbol, j) => {
        if (symbol === 14) {
          const placementTile = new PlacementTile({ texture: placementTexture })
          placementTile.position.set(j * cell, i / tilesPerRow * cell)
          placementTiles.push(placementTile)
        }
      })
    }

    placementTiles.forEach(item => this.addChild(item))
  }

  cleanFromAll (): void {
    for (const placementTile of this.placementTiles) {
      placementTile.removeFromParent()
    }
    this.placementTiles = []
  }

  restart (): void {
    this.cleanFromAll()
    this.setup()
  }
}
