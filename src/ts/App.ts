import Uniform from './Uniform'
import { loadImg } from './utils'
import { createDepth } from './createDepth'

export default class App {
  private canvas: HTMLCanvasElement
  private context: WebGLRenderingContext
  private container: HTMLCanvasElement
  private startTime: number
  private ratio: number
  private winWidth: number
  private winHeight: number
  private vTh: number
  private hTh: number
  private program: WebGLProgram
  private glContext: WebGLRenderingContext

  private uResolution: Uniform
  private uMouse: Uniform
  private uTime: Uniform
  private uRatio: Uniform
  private uThreshold: Uniform

  private positionLocation: number

  constructor(vertexShaderSource: string, fragmentShaderSource: string) {
    this.canvas = document.createElement('canvas')
    this.glContext = this.canvas.getContext('webgl')
    this.winWidth = window.innerWidth
    this.winHeight = window.innerHeight
    this.ratio = window.devicePixelRatio
    this.startTime = new Date().getTime()

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

    const buffer: WebGLBuffer = this.glContext.createBuffer()
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
  }

  public async createFake3D(imgSrc: string): Promise<void> {
    const texture: WebGLTexture = await this.createTexture(imgSrc)
    const depthTexture: WebGLTexture = await this.createTexture(imgSrc, true)

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

    this.glContext.activeTexture(this.glContext.TEXTURE0)
    this.glContext.bindTexture(this.glContext.TEXTURE_2D, texture)
    this.glContext.activeTexture(this.glContext.TEXTURE1)
    this.glContext.bindTexture(this.glContext.TEXTURE_2D, depthTexture)
  }

  private addShader(source: string, type: number): void {
    const shader: WebGLShader = this.glContext.createShader(type)
    this.glContext.shaderSource(shader, source)
    this.glContext.compileShader(shader)

    if (
      !this.glContext.getShaderParameter(shader, this.glContext.COMPILE_STATUS)
    ) {
      throw new Error(`error: ${this.glContext.getShaderInfoLog(shader)}`)
    }

    this.glContext.attachShader(this.program, shader)
  }

  private async createTexture(
    imgSrc: string,
    depth: boolean = false
  ): Promise<WebGLTexture> {
    const image: HTMLImageElement | HTMLCanvasElement = depth
      ? await createDepth(imgSrc, 10)
      : await loadImg(imgSrc)
    const texture: WebGLTexture = this.glContext.createTexture()
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
      image
    )

    return texture
  }
}
