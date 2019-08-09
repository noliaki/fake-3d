import Fake3D from './Fake3D'
import vertexShaderSource from '../shader/vertex.glsl'
import fragmentShaderSource from '../shader/fragment.glsl'
import { createDepth } from './createDepth'

let fake3D: Fake3D

async function init(): Promise<void> {
  fake3D = new Fake3D({
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
    vertexShaderSource,
    fragmentShaderSource,
    imgSrc: '/img/cat.jpg',
    blur: 30
  })

  await fake3D.bindTexture()
  render()
}

init()

function render() {
  fake3D.dx = Math.sin(new Date().getTime() / 1000) * 0.5
  // fake3D.dy = Math.sin(new Date().getTime() / 1000)

  fake3D.render()
  requestAnimationFrame(render)
}
