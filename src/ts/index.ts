import { createDepth } from './createDepth'

async function init(): Promise<void> {
  const canvas: HTMLCanvasElement = document.getElementById(
    'canvas'
  ) as HTMLCanvasElement
  const context: CanvasRenderingContext2D = canvas.getContext('2d')
  const depthImage: HTMLCanvasElement = await createDepth('/img/cat.jpg', 20)

  canvas.width = depthImage.width
  canvas.height = depthImage.height
  context.drawImage(depthImage, 0, 0)
}

init()
