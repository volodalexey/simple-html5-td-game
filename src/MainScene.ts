import { Container, type FederatedPointerEvent } from 'pixi.js'
import { StatusBar } from './StatusBar'
import { logKeydown, logLayout, logPointerEvent } from './logger'
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
    logLayout(`Handle Resize viewWidth=${options.viewWidth} viewHeight=${options.viewHeight}`)
    this.map.handleResize(options)
    // this.centerModal(options)
  }

  centerModal ({ viewWidth, viewHeight }: { viewWidth: number, viewHeight: number }): void {
    this.startModal.position.set(viewWidth / 2 - this.startModal.boxOptions.width / 2, viewHeight / 2 - this.startModal.boxOptions.height / 2)
  }

  handleUpdate (): void {
    if (this.gameEnded) {
      //
    }
    this.map.handleUpdate()

    // if (hearts === 0) {
    //   console.log('game over')
    //   cancelAnimationFrame(animationId)
    //   document.querySelector('#gameOver').style.display = 'flex'
    // }
  }

  addEventLesteners (): void {
    this.map.backgroound.interactive = true
    this.map.backgroound.on('pointerdown', this.handlePointerDown)
    this.map.backgroound.on('pointermove', this.handlePointerMove)
    this.map.backgroound.on('pointerup', this.handlePointerUp)
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
