import React, {
  ReactElement,
  useRef,
  useCallback,
  useEffect,
  useState
} from 'react'
import createDepthMap from './createDepth'
import Fake3D from './Fake3D'
import _debounce from 'lodash/debounce'

export enum Status {
  Streaming,
  Loading,
  Done
}

export default function(): ReactElement {
  const amount: number = 2.5
  const fake3D: React.MutableRefObject<Fake3D> = useRef()
  const screenCanvas: React.MutableRefObject<HTMLCanvasElement> = useRef()
  const [status, setStatus] = useState(Status.Streaming)

  const videoEl: React.MutableRefObject<HTMLVideoElement> = useRef()
  const onClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void = useCallback(
    async (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): Promise<void> => {
      event.preventDefault()
      setStatus(Status.Loading)
      fake3D.current = await createFake3D(videoEl.current, screenCanvas.current)
      videoEl.current.pause()
      videoEl.current.srcObject = null
      setStatus(Status.Done)
      render()
    },
    []
  )

  const onMouseMove: (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => void = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void => {
      const box: HTMLElement = event.currentTarget as HTMLElement

      const boxWidth: number = box.clientWidth
      const boxHeight: number = box.clientHeight

      const x: number = -(event.clientX * 2 - boxWidth) / boxWidth
      const y: number = -(event.clientY * 2 - boxHeight) / boxHeight

      fake3D.current.dx = x * amount
      fake3D.current.dy = y * amount
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
    window.addEventListener(
      'resize',
      _debounce(() => {
        if (!fake3D.current) return
        fake3D.current.setup()
      }, 300),
      false
    )
  }, [])

  const wrapperClass: string[] = ['wrapper', Status[status]]
  if (status === Status.Loading) {
    wrapperClass.push('-loading')
  }

  function render() {
    fake3D.current.render()
    requestAnimationFrame(render)
  }

  const videoComponent: ReactElement = (
    <div className="media">
      <video ref={videoEl}></video>
      <button type="button" onClick={onClick}>
        OK
      </button>
      <canvas ref={screenCanvas}></canvas>
    </div>
  )

  return (
    <div className={wrapperClass.join(' ')}>
      <>
        {status !== Status.Done ? videoComponent : null}
        <canvas
          className="screen"
          ref={screenCanvas}
          onMouseMove={onMouseMove}
        ></canvas>
      </>
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

async function createFake3D(
  videoEl: HTMLVideoElement,
  screenEl: HTMLCanvasElement
): Promise<Fake3D> {
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const context: CanvasRenderingContext2D = canvas.getContext('2d')

  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight

  context.drawImage(videoEl, 0, 0)

  const depthImage: HTMLCanvasElement | HTMLImageElement = await createDepthMap(
    canvas
  )

  return new Fake3D({
    canvas: screenEl,
    originalImage: canvas,
    depthImage
  })
}
