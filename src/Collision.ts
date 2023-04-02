import { logCollision } from './logger'

interface IBound {
  top: number
  right: number
  bottom: number
  left: number
}

interface IMoveBound {
  bounds: IBound
  velocity: {
    vx: number
    vy: number
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Collision {
  static checkCollisionMBxB ({ bounds, velocity }: IMoveBound, b: IBound): boolean {
    /* eslint-disable @typescript-eslint/restrict-template-expressions */
    logCollision(`${bounds.top + velocity.vy} <= ${b.bottom} [${bounds.top + velocity.vy <= b.bottom}]
    ${bounds.right + velocity.vx} >= ${b.left} [${bounds.right + velocity.vx >= b.left}]
    ${bounds.bottom + velocity.vy} >= ${b.top} [${bounds.bottom + velocity.vy >= b.top}]
    ${bounds.left + velocity.vx} <= ${b.right} [${bounds.left + velocity.vx <= b.right}]`)
    /* eslint-enable @typescript-eslint/restrict-template-expressions */
    return (
      bounds.top + velocity.vy <= b.bottom &&
      bounds.right + velocity.vx >= b.left &&
      bounds.bottom + velocity.vy >= b.top &&
      bounds.left + velocity.vx <= b.right
    )
  }
}
