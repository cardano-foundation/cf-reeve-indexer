import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useEffect, useId, useRef, useState } from 'react'

import { Alert } from 'libs/ui-kit/components/Alert/Alert.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogActions } from 'libs/ui-kit/components/DialogActions/DialogActions.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { decodeQrFrame } from 'libs/ui-kit/components/QrScannerDialog/decodeQrFrame'
import type { QrScannerErrorReason } from 'libs/ui-kit/components/QrScannerDialog/qrScannerDialog.consts'
import {
  QR_SCANNER_CANCEL_LABEL,
  QR_SCANNER_ERROR_MESSAGES,
  QR_SCANNER_HINT,
  QR_SCANNER_STARTING_LABEL,
  QR_SCANNER_VIDEO_LABEL
} from 'libs/ui-kit/components/QrScannerDialog/qrScannerDialog.consts'

// One decode at a time, this long after the previous one settled — ~6 attempts a second.
const SCAN_INTERVAL_MS = 150

type ScannerStatus = { kind: 'starting' } | { kind: 'scanning' } | { kind: 'error'; reason: QrScannerErrorReason }

const errorNameOf = (error: unknown) => (typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : undefined)

const reasonForCameraError = (error: unknown): QrScannerErrorReason => {
  switch (errorNameOf(error)) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'denied'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'no-camera'
    case 'NotReadableError':
      return 'busy'
    default:
      return 'failed'
  }
}

/**
 * Owns the camera. Mounted only while the dialog is open, so its lifetime IS the camera's lifetime.
 *
 * <p>Every exit releases the stream: a scan, the effect cleanup (close/unmount), a stream handed over
 * after close, and any failure once the stream is held. `cancelled` is re-checked after every await so
 * a result that lands after close or after the first scan is dropped — onScan fires at most once.
 */
const ScannerBody = ({ onScan }: { onScan: (text: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onScanRef = useRef(onScan)
  const [status, setStatus] = useState<ScannerStatus>({ kind: 'starting' })

  // Read through a ref so a parent re-render with a new callback never restarts the camera.
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    let cancelled = false
    let stream: MediaStream | null = null
    let timer: ReturnType<typeof setTimeout> | undefined

    const stop = () => {
      cancelled = true
      clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
      stream = null
      if (video) video.srcObject = null
    }

    const fail = (reason: QrScannerErrorReason) => {
      stop()
      setStatus({ kind: 'error', reason })
    }

    const tick = async (target: HTMLVideoElement) => {
      let text: string | null
      try {
        text = await decodeQrFrame(target, canvas)
      } catch {
        if (!cancelled) fail('failed')
        return
      }
      if (cancelled) return

      const value = text?.trim()
      if (value) {
        stop()
        onScanRef.current(value)
        return
      }
      // Chained, not an interval: the next decode is scheduled only once this one has settled.
      timer = setTimeout(() => void tick(target), SCAN_INTERVAL_MS)
    }

    const start = async () => {
      // Browsers hide mediaDevices on insecure origins, so say why rather than "unsupported".
      if (!window.isSecureContext) return fail('insecure')
      if (!navigator.mediaDevices?.getUserMedia) return fail('unsupported')

      let acquired: MediaStream
      try {
        acquired = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      } catch (error) {
        if (!cancelled) fail(reasonForCameraError(error))
        return
      }
      if (cancelled) {
        // Closed while the permission prompt was up: release the camera we were only just handed.
        acquired.getTracks().forEach((track) => track.stop())
        return
      }
      stream = acquired
      // The browser can end a track on its own (camera unplugged, permission revoked). Our own stop()
      // does not fire 'ended', and sets `cancelled` first anyway.
      acquired.getTracks().forEach((track) =>
        track.addEventListener('ended', () => {
          if (!cancelled) fail('failed')
        })
      )
      if (!video) return fail('failed')

      video.srcObject = acquired
      try {
        await video.play()
      } catch {
        // Closing mid-play rejects with AbortError — expected, not a failure to report.
        if (!cancelled) fail('failed')
        return
      }
      if (cancelled) return

      setStatus({ kind: 'scanning' })
      void tick(video)
    }

    void start()
    return stop
  }, [])

  const isError = status.kind === 'error'

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {status.kind === 'error' ? (
        <Alert severity="warning">{QR_SCANNER_ERROR_MESSAGES[status.reason]}</Alert>
      ) : (
        <Typography color="text.secondary" variant="body2">
          {status.kind === 'starting' ? QR_SCANNER_STARTING_LABEL : QR_SCANNER_HINT}
        </Typography>
      )}

      {/* Kept mounted (only hidden) on error so the video ref stays stable for the effect. */}
      <Box sx={{ position: 'relative', display: isError ? 'none' : 'block', width: '100%', aspectRatio: '4 / 3', bgcolor: 'common.black', borderRadius: 1, overflow: 'hidden' }}>
        <video ref={videoRef} aria-label={QR_SCANNER_VIDEO_LABEL} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '60%',
            aspectRatio: '1',
            transform: 'translate(-50%, -50%)',
            border: '2px dashed',
            borderColor: 'common.white',
            borderRadius: 1,
            pointerEvents: 'none'
          }}
        />
        {status.kind === 'starting' && <CircularProgress size={32} sx={{ position: 'absolute', top: 'calc(50% - 16px)', left: 'calc(50% - 16px)', color: 'common.white' }} />}
      </Box>
    </Box>
  )
}

export type QrScannerDialogProps = {
  open: boolean
  title: string
  onClose: () => void
  /** Called at most once per open, with the trimmed, non-empty decoded text. The camera is already released. */
  onScan: (text: string) => void
}

/**
 * Camera QR scanner in a dialog. The scanner body is rendered only while `open` — NOT left to the
 * dialog's own mount lifetime — because MUI keeps a closing dialog's children mounted for its whole
 * exit transition, which would leave the camera running (and able to fire onScan) after Cancel.
 */
export const QrScannerDialog = ({ open, title, onClose, onScan }: QrScannerDialogProps) => {
  const titleId = useId()

  return (
    <Dialog aria-labelledby={titleId} fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>{open && <ScannerBody onScan={onScan} />}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{QR_SCANNER_CANCEL_LABEL}</Button>
      </DialogActions>
    </Dialog>
  )
}
