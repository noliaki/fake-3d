import '@babel/polyfill'
import * as faceapi from 'face-api.js'
import Fake3D from './Fake3D'

import DepthMap from './DepthMap'
import { loadImg } from './utils'

let fake3D

async function init() {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('./weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./weights'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('./weights'),
    faceapi.nets.tinyFaceDetector.loadFromUri('./weights')
  ])

  const girl = await loadImg('/img/girl-mini.jpg')
  const result = await faceapi.detectSingleFace(girl).withFaceLandmarks()
  const depthMap = new DepthMap(result, girl)

  fake3D = new Fake3D({
    canvas: document.getElementById('canvas'),
    imageEl: girl,
    depthMap: depthMap
  })

  document.querySelector('.wrapper').appendChild(fake3D.canvas)
  document.querySelector('.wrapper').appendChild(girl)
  document.querySelector('.wrapper').appendChild(depthMap)
  render()
}

function render() {
  fake3D.dx = Math.cos(new Date().getTime() / 800) * 0.1
  fake3D.dy = Math.sin(new Date().getTime() / 600) * 0.7

  fake3D.render()
  requestAnimationFrame(render)
}

init()
