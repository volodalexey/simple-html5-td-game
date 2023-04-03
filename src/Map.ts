import { Container, Sprite, type Texture } from 'pixi.js'
import { type ITileLayer, type IMapSettings, type IObjectGroupLayer } from './LoaderScene'
import { PlacementTile } from './PlacementTile'
import { Enemy } from './Enemy'
import { type Explosion } from './Explosion'
import { logExplosion } from './logger'

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
    cell: 64,
    viewportMove: 40
  }

  public backgroound!: Sprite
  public mapSettings!: IMapSettings
  public placementTiles = new Container<PlacementTile>()
  public textures!: IMapOptions['textures']
  public spawnEnemiesCount = 3
  public enemies = new Container<Enemy>()
  public explosions: Explosion[] = []
  public pointerXDown: number | null = null
  public pointerYDown: number | null = null
  public maxXPivot = 0
  public maxYPivot = 0

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
      enemies,
      placementTiles,
      textures: {
        mapTexture,
        placementTexture
      }
    } = this

    this.backgroound = new Sprite(mapTexture)
    this.addChild(this.backgroound)

    this.spawnEnemies()
    this.addChild(enemies)

    const { tilesPerRow, cell } = Map.options
    const placementTilesLayer = this.findTileLayer('Placement Tiles')

    for (let i = 0; i < placementTilesLayer.data.length; i += tilesPerRow) {
      const row = placementTilesLayer.data.slice(i, i + tilesPerRow)
      row.forEach((symbol, j) => {
        if (symbol === 14) {
          const placementTile = new PlacementTile({ texture: placementTexture })
          placementTile.position.set(j * cell, i / tilesPerRow * cell)
          placementTiles.addChild(placementTile)
        }
      })
    }

    this.addChild(placementTiles)
  }

  cleanFromAll (): void {
    for (const placementTile of this.placementTiles.children) {
      placementTile.removeFromParent()
    }
  }

  restart (): void {
    this.cleanFromAll()
    this.setup()
  }

  handleResize ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }): void {
    this.placementTiles.visible = false
    this.enemies.visible = false
    const totalHeight = this.textures.mapTexture.height
    if (viewHeight > totalHeight) {
      this.scale.y = this.scale.x = viewHeight / this.textures.mapTexture.height
      this.maxYPivot = 0
    } else {
      this.scale.y = this.scale.x = 1
      this.height = this.textures.mapTexture.height
    }
    if (this.width > viewWidth) {
      this.maxXPivot = (this.width - viewWidth) / this.scale.x
    } else {
      this.maxXPivot = 0
    }
    if (this.height > viewHeight) {
      this.maxYPivot = (this.height - viewHeight) / this.scale.y
    } else {
      this.maxYPivot = 0
    }
    this.pivot.set(0, 0)
    this.placementTiles.visible = true
    this.enemies.visible = true
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
      this.enemies.addChild(enemy)
    }
  }

  handleUpdate (): void {
    for (let i = 0; i < this.enemies.children.length; i++) {
      const enemy = this.enemies.children[i]
      enemy.handleUpdate()

      if (enemy.position.x > this.backgroound.width) {
        // hearts -= 1
        this.enemies.children.splice(i, 1)
        enemy.removeFromParent()
        i--
      }
    }

    for (let i = 0; i < this.explosions.length; i++) {
      const explosion = this.explosions[i]

      if (explosion.currentFrame >= explosion.totalFrames - 1) {
        this.explosions.splice(i, 1)
        explosion.removeFromParent()
        i--
        logExplosion(`Removed explosion ${this.explosions.length}`)
      }
    }

    // tracking total amount of enemies
    if (this.enemies.children.length === 0) {
      this.spawnEnemiesCount += 2
      this.spawnEnemies()
    }
  }

  isPointerDown (): boolean {
    return this.pointerXDown !== null && this.pointerYDown !== null
  }

  handleViewportUpMove (): void {
    this.pivot.y -= Map.options.viewportMove
    this.checkViewport()
  }

  handleViewportDownMove (): void {
    this.pivot.y += Map.options.viewportMove
    this.checkViewport()
  }

  handleViewportLeftMove (): void {
    this.pivot.x -= Map.options.viewportMove
    this.checkViewport()
  }

  handleViewportRightMove (): void {
    this.pivot.x += Map.options.viewportMove
    this.checkViewport()
  }

  handleViewportMove (downOrUp: boolean | undefined, x: number, y: number): void {
    if (downOrUp === true) {
      this.pointerXDown = x
      this.pointerYDown = y
    } else if (downOrUp === false) {
      this.pointerXDown = null
      this.pointerYDown = null
    } else if (this.isPointerDown()) {
      const diffX = this.pointerXDown as number - x
      const diffY = this.pointerYDown as number - y
      this.pivot.x += diffX
      this.pivot.y += diffY
      this.checkViewport()
      this.pointerXDown = x
      this.pointerYDown = y
    }
  }

  checkViewport (): void {
    if (this.pivot.x < 0) {
      this.pivot.x = 0
    } else if (this.pivot.x > this.maxXPivot) {
      this.pivot.x = this.maxXPivot
    }
    if (this.pivot.y < 0) {
      this.pivot.y = 0
    } else if (this.pivot.y > this.maxYPivot) {
      this.pivot.y = this.maxYPivot
    }
  }
}
