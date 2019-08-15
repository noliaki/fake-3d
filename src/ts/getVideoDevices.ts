export default async (): Promise<MediaDeviceInfo[]> => {
  const mediaDevices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices()

  return mediaDevices.filter(
    (device: MediaDeviceInfo): boolean => device.kind === 'videoinput'
  )
}
