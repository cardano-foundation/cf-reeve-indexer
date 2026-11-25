import type jsQR from 'jsqr'

type JsQR = typeof jsQR

// Wider frames only cost decode time: a QR that fills a reasonable part of the view is still several
// pixels per module at this width.
const MAX_DECODE_WIDTH = 800

let jsQRPromise: Promise<JsQR> | null = null

/**
 * The decoder is loaded on first use so it stays out of the entry bundle. A failed load is not cached,
 * so a transient network error can be retried by reopening the scanner. (A chunk that 404s after a
 * redeploy stays broken until the page is reloaded — that case surfaces as the scanner's "failed".)
 */
const loadJsQR = (): Promise<JsQR> => {
  if (!jsQRPromise) {
    jsQRPromise = import('jsqr')
      .then((module) => module.default)
      .catch((error: unknown) => {
        jsQRPromise = null
        throw error
      })
  }
  return jsQRPromise
}

/**
 * Decodes the QR code in the video's current frame, or returns null when there is no frame yet or no
 * readable code in it. Rejects only if the decoder cannot be loaded. Runs entirely in the browser — no
 * network beyond the app's own lazily loaded chunk.
 */
export const decodeQrFrame = async (video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<string | null> => {
  const decode = await loadJsQR()

  const { videoWidth, videoHeight } = video
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !videoWidth || !videoHeight) return null

  const scale = Math.min(1, MAX_DECODE_WIDTH / videoWidth)
  const width = Math.round(videoWidth * scale)
  const height = Math.round(videoHeight * scale)
  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null

  context.drawImage(video, 0, 0, width, height)
  const { data } = context.getImageData(0, 0, width, height)

  // attemptBoth also reads light-on-dark codes, which a wallet in dark mode may show.
  return decode(data, width, height, { inversionAttempts: 'attemptBoth' })?.data ?? null
}
