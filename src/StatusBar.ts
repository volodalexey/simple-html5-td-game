import { Container, Graphics, Sprite, Text, type Texture } from 'pixi.js'

export interface IStatusBarOptions {
  textures: {
    coinsTexture: Texture
    heartTexture: Texture
  }
}

export class StatusBar extends Container {
  static options = {
    inlinePadding: 10,
    padding: 20,
    textColor: 0xffffff,
    textSize: 24,
    textStroke: 2,
    coinsScale: 0.1,
    heartScale: 0.1,
    backgroundFill: 0x000000,
    initCoins: 125
  }

  private _hearts = 10
  private _coins = StatusBar.options.initCoins
  public background!: Graphics
  public coinsIcon!: Sprite
  public coinsText!: Text
  public heartIcon!: Sprite
  public heartsText!: Text

  constructor (options: IStatusBarOptions) {
    super()
    this.setup(options)
    this.drawBackground()
  }

  get coins (): number {
    return this._coins
  }

  get hearts (): number {
    return this._hearts
  }

  setup ({ textures: { coinsTexture, heartTexture } }: IStatusBarOptions): void {
    const { options: { padding, inlinePadding, coinsScale, heartScale, textSize, textColor, textStroke } } = StatusBar
    const background = new Graphics()
    this.addChild(background)
    this.background = background

    const coinsIcon = new Sprite(coinsTexture)
    coinsIcon.position.set(padding, padding)
    coinsIcon.scale.set(coinsScale)
    this.addChild(coinsIcon)
    this.coinsIcon = coinsIcon

    const coinsText = new Text(this._coins, {
      fontSize: textSize,
      fill: textColor,
      stroke: textStroke
    })
    coinsText.position.set(coinsIcon.x + coinsIcon.width + inlinePadding, padding)
    this.addChild(coinsText)
    this.coinsText = coinsText

    const heartIcon = new Sprite(heartTexture)
    heartIcon.position.set(coinsText.x + coinsText.width + inlinePadding, padding)
    heartIcon.scale.set(heartScale)
    this.addChild(heartIcon)
    this.heartIcon = heartIcon

    const heartsText = new Text(this._hearts, {
      fontSize: textSize,
      fill: textColor,
      stroke: textStroke
    })
    heartsText.position.set(heartIcon.x + heartIcon.width + inlinePadding, padding)
    this.addChild(heartsText)
    this.heartsText = heartsText
  }

  drawBackground (): void {
    this.background.beginFill(StatusBar.options.backgroundFill)
    this.background.drawRect(0, 0, this.width + StatusBar.options.padding * 2, this.height + StatusBar.options.padding * 2)
    this.background.endFill()
    this.background.alpha = 0.5
  }

  addCoins (coins: number): void {
    this._coins += Math.round(coins)
    this.coinsText.text = this._coins
  }

  subCoins (coins: number): void {
    this._coins -= coins
    this.coinsText.text = this._coins
  }

  subHearts (hearts: number): void {
    this._hearts -= hearts
    this.heartsText.text = this._hearts
  }

  restart (): void {
    this._coins = StatusBar.options.initCoins
    this.coinsText.text = this._coins
    this._hearts = 10
    this.heartsText.text = this._hearts
  }
}
