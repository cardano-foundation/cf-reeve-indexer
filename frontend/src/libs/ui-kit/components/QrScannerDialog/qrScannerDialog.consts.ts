/**
 * Copy for the generic QR scanner dialog. Deliberately domain-neutral ("the value"): callers supply
 * the title, and every failure message tells the user the way out — close the scanner and paste.
 */

export type QrScannerErrorReason = 'insecure' | 'unsupported' | 'denied' | 'no-camera' | 'busy' | 'failed'

export const QR_SCANNER_STARTING_LABEL = 'Starting the camera…'
export const QR_SCANNER_HINT = 'Hold the QR code inside the frame — it is read automatically.'
export const QR_SCANNER_VIDEO_LABEL = 'Camera preview'
export const QR_SCANNER_CANCEL_LABEL = 'Cancel'

export const QR_SCANNER_ERROR_MESSAGES: Record<QrScannerErrorReason, string> = {
  insecure: 'The camera is only available on a secure (HTTPS) connection. Close this and paste the value instead.',
  unsupported: 'This browser does not support camera access. Close this and paste the value instead.',
  denied: 'Camera access was blocked. Allow the camera for this site and try again, or close this and paste the value instead.',
  'no-camera': 'No camera was found on this device. Close this and paste the value instead.',
  busy: 'The camera is being used by another application. Close that application and try again, or paste the value instead.',
  failed: 'The camera could not be used to scan. Close this and paste the value instead.'
}
