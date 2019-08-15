import { loadImg } from './utils'

const min = 0
const max = 255

export async function createDepth(imgSrc = './img/cat.jpg', blur = 10) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const image = await loadImg(imgSrc)

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  context.filter = `blur(${blur}px)`
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const rgbaArr = imageData.data
  for (let i = 0, len = rgbaArr.length; i < len; i += 4) {
    const r = rgbaArr[i + 0]
    const g = rgbaArr[i + 1]
    const b = rgbaArr[i + 2]
    const a = rgbaArr[i + 3]

    const avg = a ? Math.floor((r + g + b) / 3) : 0

    rgbaArr[i + 0] = avg
    rgbaArr[i + 1] = avg
    rgbaArr[i + 2] = avg
  }

  context.putImageData(imageData, 0, 0)

  return canvas
}
