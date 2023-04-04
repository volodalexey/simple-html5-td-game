import { type AnimatedSprite, Container, Sprite, type Texture } from 'pixi.js'
import { type ITileLayer, type IMapSettings, type IObjectGroupLayer } from './LoaderScene'
import { type IPlacementTileOptions, PlacementTile } from './PlacementTile'
import { Enemy } from './Enemy'
import { Explosion } from './Explosion'
import { logExplosion } from './logger'
import { Building } from './Building'

export interface IMapOptions {
  mapSettings: IMapSettings
  textures: {
    mapTexture: Texture
    towerTextures: Texture[]
    orcTextures: Texture[]
    explosionTextures: Texture[]
    projectileTexture: Texture
    fireballTextures: Texture[]
    placementTexture: Texture
  }
  onClick: IPlacementTileOptions['onClick']
  onSubHearts: () => void
  onAddCoins: (addCoins: number) => void
}

export class Map extends Container {
  static options = {
    tilesPerRow: 20,
    cell: 64,
    viewportMove: 40
  }

  public background!: Sprite
  public mapSettings!: IMapSettings
  public textures!: IMapOptions['textures']
  public onClick!: IPlacementTileOptions['onClick']
  public onSubHearts!: IMapOptions['onSubHearts']
  public onAddCoins!: IMapOptions['onAddCoins']
  public placementTiles = new Container<PlacementTile>()
  public spawnEnemiesCount = 1
  public enemies = new Container<Enemy>()
  public explosions = new Container<Explosion>()
  public pointerXDown: number | null = null
  public pointerYDown: number | null = null
  public maxXPivot = 0
  public maxYPivot = 0

  constructor (options: IMapOptions) {
    super()
    this.onClick = options.onClick
    this.onSubHearts = options.onSubHearts
    this.onAddCoins = options.onAddCoins
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
        placementTexture,
        towerTextures,
        projectileTexture,
        fireballTextures
      },
      explosions
    } = this

    this.background = new Sprite(mapTexture)
    this.addChild(this.background)

    this.spawnEnemies()
    this.addChild(enemies)

    const { tilesPerRow, cell } = Map.options
    const placementTilesLayer = this.findTileLayer('Placement Tiles')

    for (let i = 0; i < placementTilesLayer.data.length; i += tilesPerRow) {
      const row = placementTilesLayer.data.slice(i, i + tilesPerRow)
      row.forEach((symbol, j) => {
        if (symbol === 14) {
          const placementTile = new PlacementTile({
            placementTexture,
            buildingTextures: towerTextures,
            projectileTexture,
            fireballTextures,
            cell,
            onClick: this.onClick
          })
          placementTile.position.set(j * cell, i / tilesPerRow * cell)
          placementTiles.addChild(placementTile)
        }
      })
    }

    this.addChild(placementTiles)

    this.addChild(explosions)
  }

  cleanFromAll (): void {
    while (this.placementTiles.children[0] != null) {
      this.placementTiles.children[0].removeFromParent()
    }
    while (this.enemies.children[0] != null) {
      this.enemies.children[0].removeFromParent()
    }
    while (this.explosions.children[0] != null) {
      this.explosions.children[0].removeFromParent()
    }
  }

  restart (): void {
    this.spawnEnemiesCount = 3
    this.cleanFromAll()
    this.setup()
  }

  stop (): void {
    this.enemies.children.forEach(enemy => { enemy.stop() })
    this.placementTiles.children.forEach(pt => {
      pt.building?.projectiles.children.forEach(p => {
        if (typeof (p.sprite as AnimatedSprite).stop === 'function') {
          (p.sprite as AnimatedSprite).stop()
        }
      })
    })
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
    const spawnOffset = 300 / this.spawnEnemiesCount

    for (let i = 1; i < this.spawnEnemiesCount + 1; i++) {
      const xOffset = i * spawnOffset
      const enemy = new Enemy({
        waypoints,
        textures: this.textures.orcTextures,
        moveSpeed: Math.random() > 0.5 ? 2 : 3
      })
      enemy.position.set(waypoint.x - xOffset, waypoint.y)
      this.enemies.addChild(enemy)
    }
  }

  handleUpdate (): void {
    for (let i = 0; i < this.enemies.children.length; i++) {
      const enemy = this.enemies.children[i]
      enemy.handleUpdate()

      if (enemy.isDead()) {
        enemy.removeFromParent()
        i--

        this.onAddCoins(Enemy.options.coinsReward)
      } else if (enemy.position.x > this.background.width) {
        this.onSubHearts()
        enemy.removeFromParent()
        i--
      }
    }

    for (let i = 0; i < this.explosions.children.length; i++) {
      const explosion = this.explosions.children[i]

      if (explosion.currentFrame >= explosion.totalFrames - 1) {
        explosion.removeFromParent()
        i--
        logExplosion(`Removed explosion ${this.explosions.children.length}`)
      }
    }

    for (let i = 0; i < this.placementTiles.children.length; i++) {
      const placementTile = this.placementTiles.children[i]

      if (placementTile.isOccupied()) {
        const building = placementTile.building as Building
        building.handleUpdate()
        const buildingOnMap = this.toLocal(building.getGlobalPosition())
        const buildingCenter = {
          cx: buildingOnMap.x + Map.options.cell,
          cy: buildingOnMap.y + Map.options.cell / 2
        }
        const validEnemies = this.enemies.children.filter((enemy) => {
          const enemyOnMap = this.toLocal(enemy.getGlobalPosition())
          const xDifference = enemyOnMap.x - buildingCenter.cx
          const yDifference = enemyOnMap.y - buildingCenter.cy
          const distance = Math.hypot(xDifference, yDifference)
          return distance < Enemy.options.radius + Building.options.attackRadius
        })
        building.setTarget(validEnemies[0])

        for (let p = 0; p < building.projectiles.children.length; p++) {
          const projectile = building.projectiles.children[p]
          projectile.handleUpdate()
          if (!projectile.isAlive()) {
            projectile.removeFromParent()
            p--
          } else {
            const projectilePosition = this.toLocal(projectile.getGlobalPosition())
            const targetPosition = this.toLocal(projectile.target.getGlobalPosition())
            const distance = Math.hypot(projectilePosition.x - targetPosition.x, projectilePosition.y - targetPosition.y)

            // this is when a projectile hits an enemy
            if (distance < Enemy.options.radius + projectile.radius && !projectile.target.isDead()) {
              // enemy health and enemy removal
              projectile.target.subHealth(projectile.damage)

              if (!projectile.isFireball) {
                const explosion = new Explosion({
                  textures: this.textures.explosionTextures
                })
                explosion.position.set(projectilePosition.x, projectilePosition.y)
                this.explosions.addChild(explosion)
                logExplosion(`Added explosion ${explosion.x} ${explosion.y}`)
              }

              projectile.removeFromParent()
              p--
            }
          }
        }
      }
    }

    // tracking total amount of enemies
    if (this.enemies.children.length === 0) {
      this.spawnEnemiesCount += 1
      this.spawnEnemies()
    }
  }

  isPointerDown (): boolean {
    return this.pointerXDown !== null && this.pointerYDown !== null
  }

  handleViewportUpMove (): void {
    this.pivot.y -= Map.options.viewportMove * this.scale.y
    this.checkViewport()
  }

  handleViewportDownMove (): void {
    this.pivot.y += Map.options.viewportMove * this.scale.y
    this.checkViewport()
  }

  handleViewportLeftMove (): void {
    this.pivot.x -= Map.options.viewportMove * this.scale.x
    this.checkViewport()
  }

  handleViewportRightMove (): void {
    this.pivot.x += Map.options.viewportMove * this.scale.x
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
      const diffXFloor = diffX < 0 ? Math.ceil(diffX) : Math.floor(diffX)
      const diffYFloor = diffY < 0 ? Math.ceil(diffY) : Math.floor(diffY)
      const diffXScaled = diffXFloor * this.scale.x
      const diffYScaled = diffYFloor * this.scale.y
      const minDiff = 10
      if (Math.abs(diffXScaled) > minDiff || Math.abs(diffYScaled) > minDiff) {
        this.pivot.x += diffXScaled
        this.pivot.y += diffYScaled
        this.checkViewport()
        this.pointerXDown = x
        this.pointerYDown = y
      }
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
