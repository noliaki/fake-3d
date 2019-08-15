import React, {
  useReducer,
  ReactElement,
  useRef,
  useCallback,
  useEffect
} from 'react'
import ReactDOM from 'react-dom'
import createDepthMap from './createDepth'
import Fake3D from './Fake3D'

const fake3D: React.MutableRefObject<Fake3D> = useRef()

export default async function(): Promise<ReactElement> {
  const videoEl: React.MutableRefObject<HTMLVideoElement> = useRef()
  const onClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void = useCallback(
    async (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): Promise<void> => {
      event.preventDefault()
      createFake3D(videoEl.current)
    },
    []
  )

  useEffect((): void => {
    ;(async (): Promise<void> => {
      const videoDevices: MediaDeviceInfo[] = await getVideoDevices()
      const stream: MediaStream = await getStream({
        video: {
          deviceId: videoDevices[0].deviceId
        }
      })
      videoEl.current.srcObject = stream
      await videoEl.current.play()
    })()
  }, [])

  return (
    <div className="wrapper">
      <video ref={videoEl}></video>
      <button type="button" onClick={onClick}>
        OK
      </button>
    </div>
  )
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

async function createFake3D(videoEl: HTMLVideoElement): Promise<void> {
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const context: CanvasRenderingContext2D = canvas.getContext('2d')

  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight

  context.drawImage(videoEl, 0, 0)

  const depthImage: HTMLCanvasElement | HTMLImageElement = await createDepthMap(
    canvas
  )

  fake3D.current = new Fake3D({
    originalImage: canvas,
    depthImage
  })

  render()
}

function render() {
  fake3D.current.render()
  requestAnimationFrame(render)
}
