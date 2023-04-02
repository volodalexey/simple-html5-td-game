import { Container, type FederatedPointerEvent, type Texture } from 'pixi.js'
import { StatusBar } from './StatusBar'
import { logKeydown, logKeyup, logPointerEvent } from './logger'
import { type IScene } from './SceneManager'
import { StartModal } from './StartModal'
import { type IMapOptions, Map } from './Map'
import { type IMapSettings } from './LoaderScene'

interface IShootingSceneOptions {
  viewWidth: number
  viewHeight: number
  mapSettings: IMapSettings
  textures: IMapOptions['textures']
}

export class MainScene extends Container implements IScene {
  public gameEnded = false

  public map!: Map
  public statusBar!: StatusBar
  public startModal!: StartModal
  public invaderTexture!: Texture

  constructor (options: IShootingSceneOptions) {
    super()
    this.setup(options)
    this.addEventLesteners()
  }

  setup ({ mapSettings, textures, viewWidth, viewHeight }: IShootingSceneOptions): void {
    this.map = new Map({
      mapSettings,
      textures
    })
    this.addChild(this.map)

    this.statusBar = new StatusBar()
    this.addChild(this.statusBar)

    this.startModal = new StartModal({ viewWidth, viewHeight })
    this.startModal.visible = false
    this.addChild(this.startModal)
  }

  handleResize (options: { viewWidth: number, viewHeight: number }): void {
    this.centerModal(options)
  }

  centerModal ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }): void {
    this.startModal.position.set(viewWidth / 2 - this.startModal.boxOptions.width / 2, viewHeight / 2 - this.startModal.boxOptions.height / 2)
  }

  handleUpdate (): void {
    if (this.gameEnded) {
      //
    }
  }

  addEventLesteners (): void {
    this.interactive = true
    this.on('pointerdown', this.handlePointerDown)
    this.on('pointermove', this.handlePointerMove)
    this.on('pointerup', this.handlePointerUp)
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    this.startModal.on('click', this.startGame)
  }

  handleMapViewportMove (pressed: boolean | undefined, e: FederatedPointerEvent): void {
    const pointerPoint = this.map.toLocal(e.global)
    logPointerEvent(`${e.type} px=${pointerPoint.x} py=${pointerPoint.y}`)
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
        //
        break
      case 'KeyA': case 'ArrowLeft':
        //
        break
      case 'KeyD':case 'ArrowRight':
        //
        break
      case 'KeyS': case 'ArrowDown':
        //
        break
    }
  }

  handleKeyUp = (e: KeyboardEvent): void => {
    logKeyup(`${e.code} ${e.key}`)
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':
        //
        break
      case 'KeyA': case 'ArrowLeft':
        //
        break
      case 'KeyD':case 'ArrowRight':
        //
        break
      case 'KeyS': case 'ArrowDown':
        //
        break
    }
  }

  startGame = (): void => {
    this.startModal.visible = false
    this.statusBar.clearScore()
    this.map.restart()
    this.gameEnded = false
  }

  endGame (): void {
    this.gameEnded = true
    this.startModal.scoreText.text = this.statusBar.score
    this.startModal.visible = true
  }
}
