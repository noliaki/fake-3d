import * as bodyPix from '@tensorflow-models/body-pix'
import { OutputStride } from '@tensorflow-models/body-pix/dist/mobilenet'
import { BodyPixInput } from '@tensorflow-models/body-pix/dist/types'

const rainbow: [number, number, number][] = [
  [110, 64, 170],
  [106, 72, 183],
  [100, 81, 196],
  [92, 91, 206],
  [84, 101, 214],
  [75, 113, 221],
  [66, 125, 224],
  [56, 138, 226],
  [48, 150, 224],
  [40, 163, 220],
  [33, 176, 214],
  [29, 188, 205],
  [26, 199, 194],
  [26, 210, 182],
  [28, 219, 169],
  [33, 227, 155],
  [41, 234, 141],
  [51, 240, 128],
  [64, 243, 116],
  [79, 246, 105],
  [96, 247, 97],
  [115, 246, 91],
  [134, 245, 88],
  [155, 243, 88]
]

export default async function createDepthMap(
  imageSource: BodyPixInput
): Promise<HTMLCanvasElement> {
  const net: bodyPix.BodyPix = await bodyPix.load()
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const context: CanvasRenderingContext2D = canvas.getContext('2d')

  const outputStride: OutputStride = 16
  const segmentationThreshold: number = 0.5

  const partSegmentation = await net.estimatePartSegmentation(
    imageSource,
    outputStride,
    segmentationThreshold
  )
  const coloredPartData: ImageData = bodyPix.toColoredPartImageData(
    partSegmentation,
    rainbow
  )
  const opacity: number = 1
  const maskBlurAmount: number = 30
  const flipHorizontal: boolean = false
  const poxelCellWidth: number = 2

  bodyPix.drawPixelatedMask(
    canvas,
    imageSource as HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    coloredPartData,
    opacity,
    maskBlurAmount,
    flipHorizontal,
    poxelCellWidth
  )

  const imageData: ImageData = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  )

  const data: Uint8ClampedArray = imageData.data

  for (let i: number = 0, len: number = data.length; i < len; i += 4) {
    const r: number = data[i + 0]
    const g: number = data[i + 1]
    const b: number = data[i + 2]
    const a: number = data[i + 3]

    const avg: number = 350 - (r + g + b) / 3

    data[i + 0] = avg
    data[i + 1] = avg
    data[i + 2] = avg
  }

  context.fillStyle = '#aaa'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.putImageData(imageData, 0, 0)

  return canvas
}
