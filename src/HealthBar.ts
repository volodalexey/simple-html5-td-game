import { Container, Graphics } from 'pixi.js'

export class HealthBar extends Container {
  static boxOptions = {
    border: 0xffffff,
    borderThick: 1,
    width: 60,
    height: 10,
    fill: 0x15803d,
    empty: 0xff0000
  }

  public borderBox!: Graphics
  public fillBar!: Graphics
  public emptyBar!: Graphics

  constructor () {
    super()
    this.setup()
    this.draw()
  }

  setup (): void {
    this.borderBox = new Graphics()
    this.addChild(this.borderBox)

    const bars = new Container()

    this.emptyBar = new Graphics()
    bars.addChild(this.emptyBar)

    const fillBar = new Graphics()
    bars.addChild(fillBar)
    this.fillBar = fillBar

    this.addChild(bars)
  }

  draw (): void {
    const {
      borderBox, fillBar, emptyBar
    } = this
    const { boxOptions } = HealthBar
    borderBox.beginFill(boxOptions.border)
    borderBox.drawRect(0, 0, boxOptions.width, boxOptions.height)
    borderBox.endFill()

    emptyBar.position.set(boxOptions.borderThick, boxOptions.borderThick)
    emptyBar.beginFill(boxOptions.empty)
    emptyBar.drawRect(0, 0, boxOptions.width - boxOptions.borderThick * 2, boxOptions.height - 2 * boxOptions.borderThick)
    emptyBar.endFill()

    fillBar.position.set(boxOptions.borderThick, boxOptions.borderThick)
    fillBar.beginFill(boxOptions.fill)
    fillBar.drawRect(0, 0, boxOptions.width - boxOptions.borderThick * 2, boxOptions.height - 2 * boxOptions.borderThick)
    fillBar.endFill()
  }

  setHealth (health: number): void {
    const { boxOptions } = HealthBar
    this.fillBar.width = (boxOptions.width - boxOptions.borderThick) * health
  }
}
