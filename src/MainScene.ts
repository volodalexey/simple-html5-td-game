import { Container, type FederatedPointerEvent } from 'pixi.js'
import { type IStatusBarOptions, StatusBar } from './StatusBar'
import { logKeydown, logLayout, logPointerEvent } from './logger'
import { type IScene } from './SceneManager'
import { StartModal } from './StartModal'
import { type IMapOptions, Map } from './Map'
import { type IMapSettings } from './LoaderScene'
import { PlacementTile } from './PlacementTile'

interface IShootingSceneOptions {
  viewWidth: number
  viewHeight: number
  mapSettings: IMapSettings
  mapTextures: IMapOptions['textures']
  statusTextures: IStatusBarOptions['textures']
}

export class MainScene extends Container implements IScene {
  public gameEnded = false

  public map!: Map
  public statusBar!: StatusBar
  public startModal!: StartModal

  constructor (options: IShootingSceneOptions) {
    super()
    this.setup(options)
    this.addEventLesteners()
  }

  setup ({ mapSettings, mapTextures, statusTextures, viewWidth, viewHeight }: IShootingSceneOptions): void {
    this.map = new Map({
      mapSettings,
      textures: mapTextures,
      onClick: this.handleTileClick,
      onSubHearts: this.handleSubHearts,
      onAddCoins: this.handleAddCoins
    })
    this.addChild(this.map)

    this.statusBar = new StatusBar({
      textures: statusTextures
    })
    this.addChild(this.statusBar)

    this.startModal = new StartModal({ viewWidth, viewHeight })
    this.startModal.visible = false
    this.addChild(this.startModal)
  }

  handleResize (options: { viewWidth: number, viewHeight: number }): void {
    logLayout(`Handle Resize viewWidth=${options.viewWidth} viewHeight=${options.viewHeight}`)
    this.map.handleResize(options)
    this.statusBar.scale.set(this.map.scale.x, this.map.scale.y)
    this.statusBar.position.x = options.viewWidth - this.statusBar.width
    this.centerModal(options)
  }

  centerModal ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }): void {
    this.startModal.scale.set(this.map.scale.x, this.map.scale.y)
    this.startModal.position.set(viewWidth / 2 - this.startModal.width / 2, viewHeight / 2 - this.startModal.height / 2)
  }

  handleUpdate (): void {
    if (this.gameEnded) {
      return
    }
    this.map.handleUpdate()

    if (this.statusBar.hearts <= 0) {
      this.endGame()
    }
  }

  addEventLesteners (): void {
    this.map.background.interactive = true
    this.map.background.on('pointerdown', this.handlePointerDown)
    this.map.background.on('pointermove', this.handlePointerMove)
    this.map.background.on('pointerup', this.handlePointerUp)
    window.addEventListener('keydown', this.handleKeyDown)
    this.startModal.on('click', this.startGame)
  }

  handleMapViewportMove (pressed: boolean | undefined, e: FederatedPointerEvent): void {
    const pointerPoint = this.map.toLocal(e.global)
    logPointerEvent(`${e.type} px=${pointerPoint.x} py=${pointerPoint.y}`)
    this.map.handleViewportMove(pressed, pointerPoint.x, pointerPoint.y)
  }

  handlePointerDown = (e: FederatedPointerEvent): void => {
    this.handleMapViewportMove(true, e)
  }

  handlePointerMove = (e: FederatedPointerEvent): void => {
    this.handleMapViewportMove(undefined, e)
  }

  handlePointerUp = (e: FederatedPointerEvent): void => {
    this.handleMapViewportMove(false, e)
  }

  handleKeyDown = (e: KeyboardEvent): void => {
    logKeydown(`${e.code} ${e.key}`)
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':
        this.map.handleViewportUpMove()
        break
      case 'KeyA': case 'ArrowLeft':
        this.map.handleViewportLeftMove()
        break
      case 'KeyD':case 'ArrowRight':
        this.map.handleViewportRightMove()
        break
      case 'KeyS': case 'ArrowDown':
        this.map.handleViewportDownMove()
        break
    }
  }

  startGame = (): void => {
    this.startModal.visible = false
    this.statusBar.restart()
    this.map.restart()
    this.gameEnded = false
  }

  endGame (): void {
    this.gameEnded = true
    this.startModal.scoreText.text = this.statusBar.coins
    this.startModal.visible = true
    this.map.stop()
  }

  handleTileClick = (tile: PlacementTile): void => {
    if (this.gameEnded) {
      return
    }
    if (this.statusBar.coins >= PlacementTile.options.cost) {
      this.statusBar.subCoins(PlacementTile.options.cost)
      tile.occupie()
      this.map.placementTiles.children.sort((a, b) => a.position.y - b.position.y)
    }
  }

  handleSubHearts = (): void => {
    this.statusBar.subHearts(1)
  }

  handleAddCoins = (addCoins: number): void => {
    this.statusBar.addCoins(addCoins)
  }
}
