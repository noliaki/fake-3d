import Uniform from './Uniform'
import vertexShaderSource from '../shader/vertex.glsl'
import fragmentShaderSource from '../shader/fragment.glsl'

export default class Fake3D {
  constructor({ canvas, imgSrc, blur = 10, imageEl, depthMap }) {
    this.dx = 0
    this.dy = 0
    this.vTh = 35
    this.hTh = 10
    this.imageEl = imageEl
    this.depthMap = depthMap
    this.blur = blur
    this.imgSrc = imgSrc
    this.canvas = canvas || document.createElement('canvas')
    this.glContext = this.canvas.getContext('webgl')
    this.winWidth = window.innerWidth
    this.winHeight = window.innerHeight

    this.canvas.width = this.winWidth
    this.canvas.height = this.winHeight

    this.ratio = window.devicePixelRatio

    this.program = this.glContext.createProgram()
    this.addShader(vertexShaderSource, this.glContext.VERTEX_SHADER)
    this.addShader(fragmentShaderSource, this.glContext.FRAGMENT_SHADER)

    this.glContext.linkProgram(this.program)
    this.glContext.useProgram(this.program)

    this.uResolution = new Uniform(
      'resolution',
      '4f',
      this.program,
      this.glContext
    )
    this.uMouse = new Uniform('mouse', '2f', this.program, this.glContext)
    this.uTime = new Uniform('time', '1f', this.program, this.glContext)
    this.uRatio = new Uniform('pixelRatio', '1f', this.program, this.glContext)
    this.uThreshold = new Uniform(
      'threshold',
      '2f',
      this.program,
      this.glContext
    )

    const buffer = this.glContext.createBuffer()
    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, buffer)
    this.glContext.bufferData(
      this.glContext.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      this.glContext.STATIC_DRAW
    )

    this.positionLocation = this.glContext.getAttribLocation(
      this.program,
      'a_position'
    )
    this.glContext.enableVertexAttribArray(this.positionLocation)
    this.glContext.vertexAttribPointer(
      this.positionLocation,
      2,
      this.glContext.FLOAT,
      false,
      0,
      0
    )

    this.uResolution.set(this.canvas.width, this.canvas.height, 1, 1)
    this.uRatio.set(1 / this.ratio)
    this.uThreshold.set(this.hTh, this.vTh)
    this.glContext.viewport(
      0,
      0,
      this.canvas.width * this.ratio,
      this.canvas.height * this.ratio
    )
    this.texture = this.imageEl

    const u_image0Location = this.glContext.getUniformLocation(
      this.program,
      'image0'
    )
    const u_image1Location = this.glContext.getUniformLocation(
      this.program,
      'image1'
    )

    // set which texture units to render with.
    this.glContext.uniform1i(u_image0Location, 0) // texture unit 0
    this.glContext.uniform1i(u_image1Location, 1) // texture unit 1

    this.imageAspect = this.imageEl.naturalHeight / this.imageEl.naturalWidth

    this.glContext.activeTexture(this.glContext.TEXTURE0)
    this.glContext.bindTexture(
      this.glContext.TEXTURE_2D,
      this.createTexture(this.imageEl)
    )
    this.glContext.activeTexture(this.glContext.TEXTURE1)
    this.glContext.bindTexture(
      this.glContext.TEXTURE_2D,
      this.createTexture(this.depthMap)
    )

    this.setup()
  }

  render() {
    if (!this.startTime) {
      this.startTime = new Date().getTime()
    }

    const currentTime = (new Date().getTime() - this.startTime) / 1000
    this.uTime.set(currentTime)
    this.uMouse.set(this.dx, this.dy)
    this.glContext.drawArrays(this.glContext.TRIANGLE_STRIP, 0, 4)
  }

  addShader(source, type) {
    const shader = this.glContext.createShader(type)
    this.glContext.shaderSource(shader, source)
    this.glContext.compileShader(shader)

    if (
      !this.glContext.getShaderParameter(shader, this.glContext.COMPILE_STATUS)
    ) {
      throw new Error(`error: ${this.glContext.getShaderInfoLog(shader)}`)
    }

    this.glContext.attachShader(this.program, shader)
  }

  createTexture(imageSource) {
    imageSource.style.width = '300px'
    document.querySelector('.wrapper').appendChild(imageSource)

    const texture = this.glContext.createTexture()
    this.glContext.bindTexture(this.glContext.TEXTURE_2D, texture)
    this.glContext.texParameteri(
      this.glContext.TEXTURE_2D,
      this.glContext.TEXTURE_WRAP_S,
      this.glContext.CLAMP_TO_EDGE
    )
    this.glContext.texParameteri(
      this.glContext.TEXTURE_2D,
      this.glContext.TEXTURE_WRAP_T,
      this.glContext.CLAMP_TO_EDGE
    )
    this.glContext.texParameteri(
      this.glContext.TEXTURE_2D,
      this.glContext.TEXTURE_MIN_FILTER,
      this.glContext.LINEAR
    )
    this.glContext.texParameteri(
      this.glContext.TEXTURE_2D,
      this.glContext.TEXTURE_MAG_FILTER,
      this.glContext.LINEAR
    )

    // Upload the image into the texture.
    this.glContext.texImage2D(
      this.glContext.TEXTURE_2D,
      0,
      this.glContext.RGBA,
      this.glContext.RGBA,
      this.glContext.UNSIGNED_BYTE,
      imageSource
    )

    return texture
  }

  setup() {
    this.winWidth = window.innerWidth
    this.winHeight = window.innerHeight
    this.ratio = window.devicePixelRatio

    this.canvas.width = this.winWidth * this.ratio
    this.canvas.height = this.winHeight * this.ratio
    this.canvas.style.width = `${this.winWidth}px`
    this.canvas.style.height = `${this.winHeight}px`

    if (this.winHeight / this.winWidth < this.imageAspect) {
      this.uResolution.set(
        this.winWidth,
        this.winHeight,
        1,
        this.winHeight / this.winWidth / this.imageAspect
      )
    } else {
      this.uResolution.set(
        this.winWidth,
        this.winHeight,
        (this.winWidth / this.winHeight) * this.imageAspect,
        1
      )
    }
    this.uRatio.set(1 / this.ratio)

    this.glContext.viewport(
      0,
      0,
      this.winWidth * this.ratio,
      this.winHeight * this.ratio
    )
  }
}
