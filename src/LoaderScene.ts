import { Container, Graphics, Assets, type ResolverManifest, type Spritesheet, type Texture } from 'pixi.js'
import { logLayout } from './logger'
import { type IScene } from './SceneManager'

export const manifest: ResolverManifest = {
  bundles: [
    {
      name: 'bundle-1',
      assets: {
        spritesheet: 'assets/spritesheets/spritesheet.json',
        map: 'assets/images/map.png',
        settings: 'assets/settings/settings.json'
      }
    }
  ]
}

export interface ITileLayer {
  data: number[]
  height: number
  id: number
  name: string
  opacity: number
  type: 'tilelayer'
  visible: boolean
  width: number
  x: number
  y: number
}

export interface IGroupLayer {
  id: number
  layers: ITileLayer[]
  name: string
  opacity: number
  type: 'group'
  visible: boolean
  x: number
  y: number
}

export interface IPolylinePoint {
  x: number
  y: number
}

export interface IObject {
  class: string
  height: number
  id: number
  name: string
  polyline: IPolylinePoint[]
  rotation: number
  visible: boolean
  width: number
  x: number
  y: number
}

export interface IObjectGroupLayer {
  draworder: 'topdown'
  id: number
  name: string
  objects: IObject[]
  opacity: number
  type: 'objectgroup'
  visible: boolean
  x: number
  y: number
}

export interface IMapSettings {
  compressionlevel: number
  height: number
  infinite: boolean
  layers: Array<ITileLayer | IGroupLayer | IObjectGroupLayer>
  nextlayerid: number
  nextobjectid: number
  orientation: 'orthogonal'
  renderorder: 'right-down'
  tiledversion: number
  tileheight: number
}

export interface ILoaderSceneOptions {
  viewWidth: number
  viewHeight: number
}

export class LoaderScene extends Container implements IScene {
  static barOptions = {
    width: 350,
    height: 40,
    fillColor: 0x183dd0,
    borderRadius: 5,
    borderThick: 5,
    borderColor: 0x000000
  }

  private loaderBarFill !: Graphics
  private loaderBarBorder!: Graphics
  constructor (_: ILoaderSceneOptions) {
    super()

    this.setup()
    this.draw()
  }

  setup (): void {
    const loaderBarBorder = new Graphics()
    this.addChild(loaderBarBorder)
    this.loaderBarBorder = loaderBarBorder

    const loaderBarFill = new Graphics()
    this.addChild(loaderBarFill)
    this.loaderBarFill = loaderBarFill
  }

  draw (): void {
    const { barOptions } = LoaderScene
    const { loaderBarFill, loaderBarBorder } = this
    loaderBarBorder.beginFill(barOptions.borderColor)
    loaderBarBorder.drawRoundedRect(0, 0, barOptions.width, barOptions.height, barOptions.borderRadius)
    loaderBarBorder.endFill()

    loaderBarFill.beginFill(barOptions.fillColor)
    loaderBarFill.drawRoundedRect(
      barOptions.borderThick,
      barOptions.borderThick,
      barOptions.width - barOptions.borderThick * 2,
      barOptions.height - barOptions.borderThick * 2,
      barOptions.borderRadius)
    loaderBarFill.endFill()
  }

  async initializeLoader (): Promise<void> {
    await Assets.init({ manifest })

    await Assets.loadBundle(manifest.bundles.map(bundle => bundle.name), this.downloadProgress)
  }

  private readonly downloadProgress = (progressRatio: number): void => {
    this.loaderBarFill.width = (LoaderScene.barOptions.width - LoaderScene.barOptions.borderThick * 2) * progressRatio
  }

  public getAssets (): {
    spritesheet: Spritesheet
    map: Texture
    settings: IMapSettings
  } {
    return {
      spritesheet: Assets.get('spritesheet'),
      map: Assets.get('map'),
      settings: Assets.get('settings')
    }
  }

  public handleResize ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }): void {
    const availableWidth = viewWidth
    const availableHeight = viewHeight
    const totalWidth = this.width
    const totalHeight = this.height
    if (availableWidth >= totalWidth && availableHeight >= totalHeight) {
      const x = availableWidth > totalWidth ? (availableWidth - totalWidth) / 2 : 0
      const y = availableHeight > totalHeight ? (availableHeight - totalHeight) / 2 : 0
      logLayout(`Spacing aw=${availableWidth} tw=${totalWidth} ah=${availableHeight} th=${totalHeight}`)
      this.x = x
      this.width = LoaderScene.barOptions.width
      this.y = y
      this.height = LoaderScene.barOptions.height
    } else {
      let scale = 1
      if (totalHeight >= totalWidth) {
        scale = availableHeight / totalHeight
        if (scale * totalWidth > availableWidth) {
          scale = availableWidth / totalWidth
        }
        logLayout(`By height (sc=${scale})`)
      } else {
        scale = availableWidth / totalWidth
        logLayout(`By width (sc=${scale})`)
        if (scale * totalHeight > availableHeight) {
          scale = availableHeight / totalHeight
        }
      }
      const occupiedWidth = Math.floor(totalWidth * scale)
      const occupiedHeight = Math.floor(totalHeight * scale)
      const x = availableWidth > occupiedWidth ? (availableWidth - occupiedWidth) / 2 : 0
      const y = availableHeight > occupiedHeight ? (availableHeight - occupiedHeight) / 2 : 0
      logLayout(`aw=${availableWidth} (ow=${occupiedWidth}) ah=${availableHeight} (oh=${occupiedHeight})`)
      this.x = x
      this.width = occupiedWidth
      this.y = y
      this.height = occupiedHeight
    }
    logLayout(`x=${this.x} y=${this.y} w=${this.width} h=${this.height}`)
  }

  handleMounted (): void {

  }

  public handleUpdate (): void {

  }
}
