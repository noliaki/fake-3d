export default class DepthMap {
  constructor(result, originalImage) {
    this.result = result
    console.log(result)
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')

    this.canvas.width = result.imageWidth
    this.canvas.height = result.imageHeight

    this.ratio = window.devicePixelRatio

    // this.context.scale(this.ratio, this.ratio)

    // this.context.clearRect(0, 0, result.imageWidth, result.imageHeight)
    // this.context.fillStyle = '#000'
    // this.context.fillRect(0, 0, result.imageWidth, result.imageHeight)

    this.context.drawImage(
      originalImage,
      0,
      0,
      result.imageWidth,
      result.imageHeight
    )

    // this.faceParts = [
    //   result.getJawOutline(),
    //   result.getNose(),
    //   result.getMouth(),
    //   result.getLeftEye(),
    //   result.getRightEye(),
    //   result.getLeftEyeBrow(),
    //   result.getRightEyeBrow()
    // ]

    // console.log(this.faceParts)

    // this.colors = ['#999', '#ccc', '#eee']

    // // this.context.filter = `blur(${10}px)`
    // this.faceParts.forEach((points, index) => {
    //   this.context.beginPath()
    //   this.context.fillStyle = this.colors[index] || '#fff'
    //   this.context.strokeStyle = this.colors[index] || '#fff'
    //   this.context.lineWidth = 30
    //   this.context.lineCap = 'round'
    //   this.context.lineJoin = 'round'

    //   points.forEach((point, index) => {
    //     if (index === 0) {
    //       this.context.moveTo(point.x, point.y)
    //     } else {
    //       this.context.lineTo(point.x, point.y)
    //     }
    //   })

    //   this.context.stroke()
    //   this.context.fill()
    // })

    return this.canvas
  }
}
