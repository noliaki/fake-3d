// import Fake3D from './Fake3D'
// import vertexShaderSource from '../shader/vertex.glsl'
// import fragmentShaderSource from '../shader/fragment.glsl'
// import { loadImg } from './utils'
import * as faceapi from 'face-api.js'

// // let fake3D: Fake3D

// function init(): void {
//   // fake3D = new Fake3D({
//   //   canvas: document.getElementById('canvas') as HTMLCanvasElement,
//   //   vertexShaderSource,
//   //   fragmentShaderSource,
//   //   imgSrc: './img/cat.jpg',
//   //   blur: 30
//   // })

//   // const minConfidence = 0.5
//   // const girl = await loadImg('/img/girl.jpg')
//   // const result = await faceapi.detectSingleFace(
//   //   girl,
//   //   new faceapi.SsdMobilenetv1Options({ minConfidence })
//   // )
//   // console.log(result)

//   // await fake3D.bindTexture()
//   // render()
// }

// init()

// function render() {
//   fake3D.dx = Math.cos(new Date().getTime() / 800) * 0.1
//   fake3D.dy = Math.sin(new Date().getTime() / 600) * 0.7

//   fake3D.render()
//   requestAnimationFrame(render)
// }

faceapi.nets.ssdMobilenetv1
  .load('./weight')
  .then(console.log)
  .catch(console.error)
