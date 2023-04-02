import { Container, Sprite, type Texture } from 'pixi.js'
import { type ITileLayer, type IMapSettings, type IObjectGroupLayer } from './LoaderScene'
import { PlacementTile } from './PlacementTile'
import { Enemy } from './Enemy'

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
  public spawnEnemiesCount = 3
  public enemies: Enemy[] = []

  constructor (options: IMapOptions) {
    super()
    this.mapSettings = options.mapSettings
    this.textures = options.textures
    this.setup()
  }

  findTileLayer (name: string): ITileLayer {
    const layer = this.mapSettings.layers.find((l): l is ITileLayer => l.type === 'tilelayer' && l.name === name)
    if (layer == null) {
      throw new Error(`Unable to detect "${name}" tile layer`)
    }
    return layer
  }

  findObjectGroupLayer (name: string): IObjectGroupLayer {
    const layer = this.mapSettings.layers.find((l): l is IObjectGroupLayer => l.type === 'objectgroup' && l.name === name)
    if (layer == null) {
      throw new Error(`Unable to detect "${name}" object group layer`)
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

    this.spawnEnemies()

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

  spawnEnemies (): void {
    const waypointsLayer = this.findObjectGroupLayer('Waypoints')

    const waypoints = waypointsLayer.objects[0].polyline
    const waypoint = waypoints[1]

    for (let i = 1; i < this.spawnEnemiesCount + 1; i++) {
      const xOffset = i * 150
      const enemy = new Enemy({
        waypoints,
        textures: this.textures.orcTextures
      })
      enemy.position.set(waypoint.x - xOffset, waypoint.y)
      this.enemies.push(enemy)
      this.addChild(enemy)
    }
  }

  handleUpdate (): void {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i]
      enemy.handleUpdate()

      if (enemy.position.x > this.backgroound.width) {
        // hearts -= 1
        this.enemies.splice(i, 1)
        enemy.removeFromParent()
        i--
      }
    }

    // tracking total amount of enemies
    if (this.enemies.length === 0) {
      this.spawnEnemiesCount += 2
      this.spawnEnemies()
    }
  }
}
