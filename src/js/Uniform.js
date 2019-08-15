export default class Uniform {
  // name
  // suffix
  // program
  // gl
  // location

  constructor(name, suffix, program, gl) {
    this.name = name
    this.suffix = suffix
    this.program = program
    this.gl = gl
    this.location = gl.getUniformLocation(program, name)
  }

  set(...values) {
    const method = `uniform${this.suffix}`
    const args = [this.location].concat(values)
    this.gl[method].apply(this.gl, args)
  }
}
