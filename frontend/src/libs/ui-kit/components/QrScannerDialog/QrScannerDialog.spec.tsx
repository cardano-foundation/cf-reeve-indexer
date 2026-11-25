import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import type { ReactElement } from 'react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { theme } from 'libs/ui-kit/theme/theme'

import { decodeQrFrame } from './decodeQrFrame'
import { QrScannerDialog } from './QrScannerDialog.component'
import { QR_SCANNER_CANCEL_LABEL, QR_SCANNER_ERROR_MESSAGES } from './qrScannerDialog.consts'

// jsdom has no canvas, so the frame decoder is the seam: each test scripts what the "camera" shows.
vi.mock('./decodeQrFrame', () => ({ decodeQrFrame: vi.fn() }))
const decodeMock = vi.mocked(decodeQrFrame)

type FakeStream = { stream: MediaStream; stop: ReturnType<typeof vi.fn>; end: () => void }

const makeStream = (): FakeStream => {
  const stop = vi.fn()
  const endedListeners: Array<() => void> = []
  const track = {
    stop,
    addEventListener: (type: string, listener: () => void) => {
      if (type === 'ended') endedListeners.push(listener)
    }
  }
  // end() simulates the browser ending the track on its own (camera unplugged, permission revoked).
  return { stream: { getTracks: () => [track] } as unknown as MediaStream, stop, end: () => endedListeners.forEach((listener) => listener()) }
}

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const domError = (name: string) => Object.assign(new Error(name), { name })

// Lets every already-settled promise continuation run, without waiting on the 150 ms scan interval.
const flushPromises = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

const sleep = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })

const wrap = (ui: ReactElement) => (
  <MuiThemeProvider theme={theme}>
    <StyledComponentsThemeProvider theme={theme}>{ui}</StyledComponentsThemeProvider>
  </MuiThemeProvider>
)

const TITLE = 'Scan the QR code'

describe('QrScannerDialog', () => {
  let getUserMedia: ReturnType<typeof vi.fn>
  let onScan: ReturnType<typeof vi.fn>
  let onClose: ReturnType<typeof vi.fn>
  let play: ReturnType<typeof vi.spyOn>

  const dialog = (open: boolean) => <QrScannerDialog open={open} title={TITLE} onClose={onClose} onScan={onScan} />

  beforeEach(() => {
    getUserMedia = vi.fn()
    onScan = vi.fn()
    onClose = vi.fn()
    decodeMock.mockReset()
    // jsdom implements neither of these; a browser on https/localhost has both.
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true })
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } })
    // jsdom's play() returns undefined rather than a promise.
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete (window as { isSecureContext?: boolean }).isSecureContext
    delete (navigator as { mediaDevices?: unknown }).mediaDevices
  })

  it('scans once, trims, and releases the camera', async () => {
    const camera = makeStream()
    getUserMedia.mockResolvedValue(camera.stream)
    // Nothing in view, then a blank decode, then a real code with surrounding whitespace.
    decodeMock.mockResolvedValueOnce(null).mockResolvedValueOnce('   ').mockResolvedValueOnce('  value  ')

    render(wrap(dialog(true)))

    await waitFor(() => expect(onScan).toHaveBeenCalledWith('value'))
    expect(onScan).toHaveBeenCalledTimes(1)
    expect(camera.stop).toHaveBeenCalled()
    expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: { ideal: 'environment' } }, audio: false })
  })

  it('calls onScan exactly once even if later frames also decode', async () => {
    getUserMedia.mockResolvedValue(makeStream().stream)
    decodeMock.mockResolvedValue('value')

    render(wrap(dialog(true)))

    await waitFor(() => expect(onScan).toHaveBeenCalled())
    // Several scan intervals later the loop must still be stopped.
    await sleep(500)
    expect(onScan).toHaveBeenCalledTimes(1)
    expect(decodeMock).toHaveBeenCalledTimes(1)
  })

  it('stops the camera synchronously when open becomes false', async () => {
    const camera = makeStream()
    getUserMedia.mockResolvedValue(camera.stream)
    decodeMock.mockResolvedValue(null)

    const { rerender } = render(wrap(dialog(true)))
    await waitFor(() => expect(decodeMock).toHaveBeenCalled())

    rerender(wrap(dialog(false)))

    // No waitFor: MUI keeps a closing dialog mounted through its exit transition, so a camera tied to
    // the DOM lifetime would still be live here.
    expect(camera.stop).toHaveBeenCalled()
    const decodesAtClose = decodeMock.mock.calls.length
    await sleep(400)
    expect(decodeMock.mock.calls.length).toBe(decodesAtClose)
  })

  it('stops a stream that arrives after close', async () => {
    const camera = makeStream()
    const pending = deferred<MediaStream>()
    getUserMedia.mockReturnValue(pending.promise)

    const { rerender } = render(wrap(dialog(true)))
    rerender(wrap(dialog(false)))

    // The permission prompt is answered only after the user already closed the scanner.
    pending.resolve(camera.stream)
    await flushPromises()

    expect(camera.stop).toHaveBeenCalled()
    expect(play).not.toHaveBeenCalled()
    expect(decodeMock).not.toHaveBeenCalled()
  })

  it('drops a decode that resolves after close', async () => {
    getUserMedia.mockResolvedValue(makeStream().stream)
    const pendingDecode = deferred<string | null>()
    decodeMock.mockReturnValue(pendingDecode.promise)

    const { rerender } = render(wrap(dialog(true)))
    await waitFor(() => expect(decodeMock).toHaveBeenCalled())

    rerender(wrap(dialog(false)))
    pendingDecode.resolve('value')
    await flushPromises()

    expect(onScan).not.toHaveBeenCalled()
  })

  it('stops the camera and shows an error when decoding fails', async () => {
    const camera = makeStream()
    getUserMedia.mockResolvedValue(camera.stream)
    // e.g. the lazily loaded decoder chunk 404s after a redeploy.
    decodeMock.mockRejectedValue(new Error('Failed to fetch dynamically imported module'))

    render(wrap(dialog(true)))

    expect(await screen.findByText(QR_SCANNER_ERROR_MESSAGES.failed)).toBeInTheDocument()
    expect(camera.stop).toHaveBeenCalled()
    expect(onScan).not.toHaveBeenCalled()
  })

  it('stops the camera and shows an error when play() fails', async () => {
    const camera = makeStream()
    getUserMedia.mockResolvedValue(camera.stream)
    play.mockImplementation(() => Promise.reject(domError('NotSupportedError')))

    render(wrap(dialog(true)))

    expect(await screen.findByText(QR_SCANNER_ERROR_MESSAGES.failed)).toBeInTheDocument()
    expect(camera.stop).toHaveBeenCalled()
    expect(decodeMock).not.toHaveBeenCalled()
  })

  it('shows an error when the camera stops delivering mid-scan', async () => {
    const camera = makeStream()
    getUserMedia.mockResolvedValue(camera.stream)
    decodeMock.mockResolvedValue(null)

    render(wrap(dialog(true)))
    await waitFor(() => expect(decodeMock).toHaveBeenCalled())

    act(() => camera.end())

    // A frozen or black preview with no explanation would look like a live scan that never succeeds.
    expect(screen.getByText(QR_SCANNER_ERROR_MESSAGES.failed)).toBeInTheDocument()
    expect(camera.stop).toHaveBeenCalled()
    const decodesAtEnd = decodeMock.mock.calls.length
    await sleep(400)
    expect(decodeMock.mock.calls.length).toBe(decodesAtEnd)
  })

  it('releases the first stream under StrictMode', async () => {
    const cameras: FakeStream[] = []
    getUserMedia.mockImplementation(() => {
      const camera = makeStream()
      cameras.push(camera)
      return Promise.resolve(camera.stream)
    })
    decodeMock.mockResolvedValue(null)

    render(<StrictMode>{wrap(dialog(true))}</StrictMode>)
    await waitFor(() => expect(decodeMock).toHaveBeenCalled())

    // StrictMode mounts, unmounts and remounts: every stream but the last must have been released.
    expect(cameras.length).toBeGreaterThan(1)
    cameras.slice(0, -1).forEach((camera) => expect(camera.stop).toHaveBeenCalled())
    expect(cameras[cameras.length - 1].stop).not.toHaveBeenCalled()
  })

  it.each([
    ['NotAllowedError', 'denied'],
    ['SecurityError', 'denied'],
    ['NotFoundError', 'no-camera'],
    ['OverconstrainedError', 'no-camera'],
    ['NotReadableError', 'busy'],
    ['AbortError', 'failed']
  ] as const)('explains a %s from getUserMedia as "%s"', async (errorName, reason) => {
    getUserMedia.mockRejectedValue(domError(errorName))

    render(wrap(dialog(true)))

    expect(await screen.findByText(QR_SCANNER_ERROR_MESSAGES[reason])).toBeInTheDocument()
    expect(onScan).not.toHaveBeenCalled()
  })

  it('explains that the camera needs a secure context', async () => {
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false })

    render(wrap(dialog(true)))

    expect(await screen.findByText(QR_SCANNER_ERROR_MESSAGES.insecure)).toBeInTheDocument()
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('explains that the browser has no camera API', async () => {
    delete (navigator as { mediaDevices?: unknown }).mediaDevices

    render(wrap(dialog(true)))

    expect(await screen.findByText(QR_SCANNER_ERROR_MESSAGES.unsupported)).toBeInTheDocument()
  })

  it('asks the caller to close on Cancel', async () => {
    getUserMedia.mockResolvedValue(makeStream().stream)
    decodeMock.mockResolvedValue(null)

    render(wrap(dialog(true)))
    await userEvent.click(screen.getByRole('button', { name: QR_SCANNER_CANCEL_LABEL }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not touch the camera while closed', () => {
    render(wrap(dialog(false)))

    expect(getUserMedia).not.toHaveBeenCalled()
  })
})
