import '@babel/polyfill'
import * as faceapi from 'face-api.js'
import DepthMap from './DepthMap'

async function init() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('./weights')
  await faceapi.nets.faceLandmark68Net.loadFromUri('./weights')
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri('./weights')
  await faceapi.nets.tinyFaceDetector.loadFromUri('./weights')
  const girl = await faceapi.fetchImage('/img/girl-mini.jpg')
  const result = await faceapi.detectFaceLandmarksTiny(girl)
  const depthMap = new DepthMap(result, girl)

  new faceapi.draw.DrawFaceLandmarks(result, { drawLines: true }).draw(depthMap)

  document.querySelector('.wrapper').appendChild(girl)
  document.querySelector('.wrapper').appendChild(depthMap)
}

init()

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
