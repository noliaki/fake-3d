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
