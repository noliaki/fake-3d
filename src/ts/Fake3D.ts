const fragmentShaderSource: string = `#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 resolution;
uniform vec2 mouse;
uniform vec2 threshold;
uniform float time;
uniform float pixelRatio;
uniform sampler2D image0;
uniform sampler2D image1;

vec2 mirrored(vec2 v) {
vec2 m = mod(v,2.);
return mix(m,2.0 - m, step(1.0 ,m));
}

void main() {
// uvs and textures
vec2 uv = pixelRatio*gl_FragCoord.xy / resolution.xy ;
vec2 vUv = (uv - vec2(0.5))*resolution.zw + vec2(0.5);
vUv.y = 1. - vUv.y;
vec4 tex1 = texture2D(image1,mirrored(vUv));
vec2 fake3d = vec2(vUv.x + (tex1.r - 0.5)*mouse.x/threshold.x, vUv.y + (tex1.r - 0.5)*mouse.y/threshold.y);
gl_FragColor = texture2D(image0,mirrored(fake3d));
}
`

const vertexShaderSource: string = `attribute vec2 a_position;

void main() {
  gl_Position = vec4( a_position, 0, 1 );
}
`

export default class Fake3D {
  public canvas: HTMLCanvasElement
  private startTime: number
  private ratio: number
  private width: number
  private height: number
  private vTh: number = 35
  private hTh: number = 10
  private program: WebGLProgram
  private glContext: WebGLRenderingContext

  private originalImage: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  private depthImage: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement

  private uResolution: Uniform
  private uMouse: Uniform
  private uTime: Uniform
  private uRatio: Uniform
  private uThreshold: Uniform

  private positionLocation: number
  private imageAspect: number

  public dx: number = 0
  public dy: number = 0

  constructor({
    canvas,
    originalImage,
    depthImage
  }: {
    canvas?: HTMLCanvasElement
    originalImage: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
    depthImage: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  }) {
    this.canvas = canvas || document.createElement('canvas')
    this.glContext = this.canvas.getContext('webgl')
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.originalImage = originalImage
    this.depthImage = depthImage

    this.canvas.width = this.width
    this.canvas.height = this.height

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

    this.uResolution.set(this.canvas.width, this.canvas.height, 1, 1)
    this.uRatio.set(1 / this.ratio)
    this.uThreshold.set(this.hTh, this.vTh)
    this.glContext.viewport(
      0,
      0,
      this.canvas.width * this.ratio,
      this.canvas.height * this.ratio
    )

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

    this.imageAspect = this.originalImage.height / this.originalImage.width

    this.glContext.activeTexture(this.glContext.TEXTURE0)
    this.glContext.bindTexture(
      this.glContext.TEXTURE_2D,
      this.createTexture(this.originalImage)
    )
    this.glContext.activeTexture(this.glContext.TEXTURE1)
    this.glContext.bindTexture(
      this.glContext.TEXTURE_2D,
      this.createTexture(this.depthImage)
    )

    this.setup()
  }

  public render(): void {
    if (!this.startTime) {
      this.startTime = new Date().getTime()
    }

    const currentTime: number = (new Date().getTime() - this.startTime) / 1000
    this.uTime.set(currentTime)
    this.uMouse.set(this.dx, this.dy)
    this.glContext.drawArrays(this.glContext.TRIANGLE_STRIP, 0, 4)
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

  private createTexture(
    imageSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ): WebGLTexture {
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
      imageSource
    )

    return texture
  }

  public setup({
    _width = window.innerWidth,
    _height = window.innerHeight
  } = {}): void {
    this.width = _width
    this.height = _height

    this.canvas.width = this.width * this.ratio
    this.canvas.height = this.height * this.ratio
    this.canvas.style.width = `${this.width}px`
    this.canvas.style.height = `${this.height}px`

    if (this.height / this.width < this.imageAspect) {
      this.uResolution.set(
        this.width,
        this.height,
        1,
        this.height / this.width / this.imageAspect
      )
    } else {
      this.uResolution.set(
        this.width,
        this.height,
        (this.width / this.height) * this.imageAspect,
        1
      )
    }
    this.uRatio.set(1 / this.ratio)

    this.glContext.viewport(
      0,
      0,
      this.width * this.ratio,
      this.height * this.ratio
    )
  }
}

class Uniform {
  name: string
  suffix: string
  program: WebGLProgram
  gl: WebGLRenderingContext
  location: WebGLUniformLocation

  constructor(
    name: string,
    suffix: string,
    program: WebGLProgram,
    gl: WebGLRenderingContext
  ) {
    this.name = name
    this.suffix = suffix
    this.program = program
    this.gl = gl
    this.location = gl.getUniformLocation(program, name)
  }

  set(...values: any[]): void {
    const method: string = `uniform${this.suffix}`
    const args: any[] = [this.location].concat(values)
    this.gl[method].apply(this.gl, args)
  }
}
