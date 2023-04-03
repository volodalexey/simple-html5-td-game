import { Container, Graphics, Sprite, type Texture } from 'pixi.js'
import { logTilePlacement } from './logger'
import { Building } from './Building'

export interface IPlacementTileOptions {
  placementTexture: Texture
  buildingTextures: Texture[]
  projectileTexture: Texture
  fireballTextures: Texture[]
  cell: number
  onClick?: (tile: PlacementTile) => void
}

export class PlacementTile extends Container {
  public cell!: number
  public background!: Graphics
  public placement!: Sprite
  public building?: Building
  public onClick!: IPlacementTileOptions['onClick']
  public buildingTextures!: IPlacementTileOptions['buildingTextures']
  public projectileTexture!: IPlacementTileOptions['projectileTexture']
  public fireballTextures!: IPlacementTileOptions['fireballTextures']
  static options = {
    cost: 75,
    tileFill: 0xa3e635
  }

  constructor (options: IPlacementTileOptions) {
    super()
    this.cell = options.cell
    this.buildingTextures = options.buildingTextures
    this.projectileTexture = options.projectileTexture
    this.fireballTextures = options.fireballTextures
    this.onClick = options.onClick
    this.setup(options)
    this.draw()

    this.enableEventLesteners()
  }

  setup ({ placementTexture }: IPlacementTileOptions): void {
    const placement = new Sprite(placementTexture)
    placement.anchor.set(0, 0.5)
    placement.alpha = 0.15
    this.addChild(placement)
    this.placement = placement
  }

  draw (): void {
    const background = new Graphics()
    background.beginFill(PlacementTile.options.tileFill)
    background.drawRect(0, 0, this.cell * 2, this.cell)
    background.endFill()
    background.alpha = logTilePlacement.enabled ? 0.5 : 0.2
    this.addChild(background)
    this.background = background
  }

  enableEventLesteners (): void {
    this.background.interactive = true
    this.background.on('pointertap', this.handleClick)
  }

  handleClick = (): void => {
    if (!this.isOccupied() && typeof this.onClick === 'function') {
      this.onClick(this)
    }
  }

  isOccupied (): boolean {
    return Boolean(this.building)
  }

  occupie (): void {
    const building = new Building({
      buildingTextures: this.buildingTextures,
      projectileTexture: this.projectileTexture,
      fireballTextures: this.fireballTextures,
      cell: this.cell
    })
    building.anchor.set(0, 0.5)
    this.addChild(building)
    this.building = building

    this.background.alpha = this.placement.alpha = 0
  }
}
