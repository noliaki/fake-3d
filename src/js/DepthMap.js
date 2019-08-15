export default class DepthMap {
  constructor(result, originalImage) {
    this.result = result
    console.log(result)
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')

    this.canvas.width = result.detection.imageWidth
    this.canvas.height = result.detection.imageHeight

    this.ratio = window.devicePixelRatio

    // this.context.scale(this.ratio, this.ratio)

    this.context.clearRect(
      0,
      0,
      result.detection.imageWidth,
      result.detection.imageHeight
    )
    this.context.fillStyle = '#000'
    this.context.fillRect(
      0,
      0,
      result.detection.imageWidth,
      result.detection.imageHeight
    )

    // this.context.drawImage(
    //   originalImage,
    //   0,
    //   0,
    //   result.detection.imageWidth,
    //   result.detection.imageHeight
    // )

    this.faceParts = [
      result.landmarks.getJawOutline(),
      result.landmarks.getNose(),
      result.landmarks.getMouth(),
      result.landmarks.getLeftEye(),
      result.landmarks.getRightEye(),
      result.landmarks.getLeftEyeBrow(),
      result.landmarks.getRightEyeBrow()
    ]

    console.log(this.faceParts)

    this.colors = ['#999', '#ccc', '#eee']

    this.context.filter = `blur(${5}px)`
    this.faceParts.forEach((points, index) => {
      this.context.beginPath()
      this.context.fillStyle = this.colors[index] || '#fff'
      this.context.strokeStyle = this.colors[index] || '#fff'
      this.context.lineWidth = result.detection.imageWidth / 100
      this.context.lineCap = 'round'
      this.context.lineJoin = 'round'

      points.forEach((point, index) => {
        if (index === 0) {
          this.context.moveTo(point.x, point.y)
        } else {
          this.context.lineTo(point.x, point.y)
        }
      })

      this.context.stroke()
      this.context.fill()
    })

    return this.canvas
  }
}
