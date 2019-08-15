export function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.addEventListener(
      'load',
      event => {
        resolve(img)
      },
      false
    )
    img.addEventListener('error', event => {
      reject(event)
    })
    img.src = src
  })
}
