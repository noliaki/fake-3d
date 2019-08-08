export default class Uniform {
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
