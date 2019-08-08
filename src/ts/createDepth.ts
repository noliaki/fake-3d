export async function createDepth(
  imgSrc: string = '/img/cat.jpg',
  blur: number
): Promise<HTMLCanvasElement> {
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const context: CanvasRenderingContext2D = canvas.getContext('2d')
  const image: HTMLImageElement = await loadImg(imgSrc)

  canvas.width = image.naturalWidth / 4
  canvas.height = image.naturalHeight / 4
  context.filter = `blur(${blur}px)`
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const imageData: ImageData = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  )
  const rgbaArr: Uint8ClampedArray = imageData.data
  for (let i: number = 0, len: number = rgbaArr.length; i < len; i += 4) {
    const r: number = rgbaArr[i + 0]
    const g: number = rgbaArr[i + 1]
    const b: number = rgbaArr[i + 2]
    const a: number = rgbaArr[i + 3]

    const avg: number = a ? Math.floor((r + g + b) / 3) : 0

    rgbaArr[i + 0] = avg * 1.3
    rgbaArr[i + 1] = avg * 1.3
    rgbaArr[i + 2] = avg * 1.3
  }

  context.putImageData(imageData, 0, 0)

  return canvas
}

export function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise(
    (
      resolve: (image: HTMLImageElement) => void,
      reject: (reson: any) => void
    ): void => {
      const img: HTMLImageElement = new Image()
      img.crossOrigin = 'Anonymous'
      img.addEventListener(
        'load',
        (event: Event): void => {
          resolve(img)
        },
        false
      )
      img.addEventListener('error', (event: ErrorEvent): void => {
        reject(event)
      })
      img.src = src
    }
  )
}
