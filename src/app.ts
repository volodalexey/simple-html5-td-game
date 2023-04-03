import './styles.css'
import { SceneManager } from './SceneManager'
import { MainScene } from './MainScene'
import { LoaderScene } from './LoaderScene'

async function run (): Promise<void> {
  const ellipsis: HTMLElement | null = document.querySelector('.ellipsis')
  if (ellipsis != null) {
    ellipsis.parentElement?.removeChild(ellipsis)
  }
  await SceneManager.initialize()
  const loaderScene = new LoaderScene({
    viewWidth: SceneManager.width,
    viewHeight: SceneManager.height
  })
  await SceneManager.changeScene(loaderScene)
  await loaderScene.initializeLoader()
  const { map, settings, spritesheet: { animations, textures } } = loaderScene.getAssets()
  await SceneManager.changeScene(new MainScene({
    viewWidth: SceneManager.width,
    viewHeight: SceneManager.height,
    mapSettings: settings,
    mapTextures: {
      mapTexture: map,
      towerTextures: animations.tower,
      orcTextures: animations.orc,
      explosionTextures: animations.explosion,
      projectileTexture: textures['projectile.png'],
      fireballTextures: animations.fireball,
      placementTexture: animations.tower[6]
    },
    statusTextures: {
      coinsTexture: textures['coins.png'],
      heartTexture: textures['heart.png']
    }
  }))
}

run().catch((err) => {
  console.error(err)
  const errorMessageDiv: HTMLElement | null = document.querySelector('.error-message')
  if (errorMessageDiv != null) {
    errorMessageDiv.classList.remove('hidden')
    errorMessageDiv.innerText = ((Boolean(err)) && (Boolean(err.message))) ? err.message : err
  }
  const errorStackDiv: HTMLElement | null = document.querySelector('.error-stack')
  if (errorStackDiv != null) {
    errorStackDiv.classList.remove('hidden')
    errorStackDiv.innerText = ((Boolean(err)) && (Boolean(err.stack))) ? err.stack : ''
  }
  const canvas: HTMLCanvasElement | null = document.querySelector('canvas')
  if (canvas != null) {
    canvas.parentElement?.removeChild(canvas)
  }
})
