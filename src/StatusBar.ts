import { Container, Text } from 'pixi.js'

export class StatusBar extends Container {
  static options = {
    padding: 20,
    textColor: 0xffffff,
    textSize: 20
  }

  private _score = 0
  public scoreText!: Text

  constructor () {
    super()
    this.setup()
  }

  get score (): number {
    return this._score
  }

  setup (): void {
    const { options: scoreOptions } = StatusBar
    const scoreText = new Text(`Score: ${this._score}`, {
      fontSize: scoreOptions.textSize,
      fill: scoreOptions.textColor
    })
    scoreText.position.set(scoreOptions.padding, scoreOptions.padding)

    this.addChild(scoreText)
    this.scoreText = scoreText
  }

  addScore (score: number): void {
    this._score += Math.round(score)
    this.scoreText.text = `Score: ${this._score}`
  }

  subScore (): void {
    this._score -= 10
    this.scoreText.text = `Score: ${this._score}`
  }

  clearScore (): void {
    this._score = 0
    this.scoreText.text = `Score: ${this._score}`
  }
}
