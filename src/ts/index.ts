import _debounce from 'lodash/debounce'

import { loadImg } from './utils'
import Fake3D from './Fake3D'
import createDepthMap from './createDepth'

let fake3D: Fake3D

const amount: number = 3

const $wrapper: Element = document.getElementsByClassName('wrapper')[0]

const videoEl: HTMLVideoElement = document.getElementById(
  'video'
) as HTMLVideoElement

const btn: HTMLButtonElement = document.getElementById(
  'shoot'
) as HTMLButtonElement

async function init(): Promise<void> {
  const videoDevices: MediaDeviceInfo[] = await getVideoDevices()
  const stream: MediaStream = await getStream({
    video: {
      deviceId: videoDevices[0].deviceId
    }
  })

  videoEl.srcObject = stream

  await videoEl.play()

  btn.addEventListener(
    'click',
    (event: MouseEvent): void => {
      event.preventDefault()
      $wrapper.classList.add('-loading')
      document.querySelector('.media').remove()

      create()
    },
    {
      passive: false
    }
  )
}

function render() {
  fake3D.render()
  requestAnimationFrame(render)
}

async function getVideoDevices(): Promise<MediaDeviceInfo[]> {
  const mediaDevices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices()

  return mediaDevices.filter(
    (device: MediaDeviceInfo): boolean => device.kind === 'videoinput'
  )
}

async function getStream(
  constraints: MediaStreamConstraints
): Promise<MediaStream> {
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia(
    constraints
  )

  return stream
}

async function create(): Promise<void> {
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const context: CanvasRenderingContext2D = canvas.getContext('2d')

  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight

  context.drawImage(videoEl, 0, 0)

  const depthImage: HTMLCanvasElement | HTMLImageElement = await createDepthMap(
    canvas
  )

  fake3D = new Fake3D({
    originalImage: canvas,
    depthImage
  })

  $wrapper.appendChild(fake3D.canvas)
  $wrapper.classList.remove('-loading')

  render()
}

init()

window.addEventListener(
  'resize',
  _debounce(() => {
    fake3D.setup()
  }, 300),
  false
)

$wrapper.addEventListener(
  'mousemove',
  (event: MouseEvent): void => {
    if (!fake3D) return

    const box: HTMLElement = event.currentTarget as HTMLElement

    const boxWidth: number = box.offsetWidth
    const boxHeight: number = box.offsetHeight

    const x: number = -(event.offsetX * 2 - boxWidth) / boxWidth
    const y: number = -(event.offsetY * 2 - boxHeight) / boxHeight

    fake3D.dx = x * amount
    fake3D.dy = y * amount
  },
  {
    passive: true
  }
)
