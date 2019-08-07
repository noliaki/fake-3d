;(async () => {
  const canvas: HTMLCanvasElement = document.getElementById(
    'canvas'
  ) as HTMLCanvasElement
  const context: CanvasRenderingContext2D = canvas.getContext('2d')
  const image: HTMLImageElement = await loadImg(
    'https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189'
  )

  canvas.width = image.naturalWidth / 2
  canvas.height = image.naturalHeight / 2
  context.drawImage(
    image,
    0,
    0,
    image.naturalWidth / 2,
    image.naturalHeight / 2
  )

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

    rgbaArr[i + 0] = avg
    rgbaArr[i + 1] = avg
    rgbaArr[i + 2] = avg
  }
  context.putImageData(imageData, 0, 0)

  function loadImg(src: string): Promise<HTMLImageElement> {
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
})()
