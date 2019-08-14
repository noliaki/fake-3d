import { loadImg } from './utils'
import * as bodyPix from '@tensorflow-models/body-pix'
import Fake3D from './Fake3D'

const rainbow: [number, number, number][] = [
  [110, 64, 170],
  [143, 61, 178],
  [178, 60, 178],
  [210, 62, 167],
  [238, 67, 149],
  [255, 78, 125],
  [255, 94, 99],
  [255, 115, 75],
  [255, 140, 56],
  [239, 167, 47],
  [217, 194, 49],
  [194, 219, 64],
  [175, 240, 91],
  [135, 245, 87],
  [96, 247, 96],
  [64, 243, 115],
  [40, 234, 141],
  [28, 219, 169],
  [26, 199, 194],
  [33, 176, 213],
  [47, 150, 224],
  [65, 125, 224],
  [84, 101, 214],
  [99, 81, 195]
]

let fake3D: Fake3D

async function init(): Promise<void> {
  const image: HTMLImageElement = await loadImg('/img/girl.jpg')
  const net: bodyPix.BodyPix = await bodyPix.load()
  const segmentation = await net.estimatePersonSegmentation(image)
  const partSegmentation = await net.estimatePartSegmentation(image)
  const coloredPartData: ImageData = bodyPix.toColoredPartImageData(
    partSegmentation,
    rainbow
  )
  const maskData: ImageData = bodyPix.toMaskImageData(segmentation, true)
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const context: CanvasRenderingContext2D = canvas.getContext('2d')
  // canvas.style.backgroundColor = '#000'
  canvas.width = maskData.width
  canvas.height = maskData.height

  context.fillStyle = '#fff'
  context.fillRect(0, 0, maskData.width, maskData.height)
  context.putImageData(maskData, 0, 0)

  document.querySelector('.wrapper').appendChild(canvas)

  const opacity: number = 1
  const maskBlurAmount: number = 30
  const flipHorizontal: boolean = false
  const poxelCellWidth: number = 4

  // bodyPix.drawMask(
  //   canvas,
  //   image,
  //   maskData,
  //   opacity,
  //   maskBlurAmount,
  //   flipHorizontal
  // )

  fake3D = new Fake3D({
    originalImage: image,
    depthImage: canvas
  })
  document.querySelector('.wrapper').appendChild(fake3D.canvas)

  // bodyPix.drawPixelatedMask(
  //   canvas,
  //   image,
  //   coloredPartData,
  //   opacity,
  //   maskBlurAmount,
  //   flipHorizontal,
  //   poxelCellWidth
  // )
  console.log(partSegmentation)
  render()
}

function render() {
  fake3D.dx = Math.cos(new Date().getTime() / 800) * 0.1
  fake3D.dy = Math.sin(new Date().getTime() / 600) * 0.7

  fake3D.render()
  requestAnimationFrame(render)
}

init()
