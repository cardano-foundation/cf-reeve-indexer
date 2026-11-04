import { describe, expect, it } from 'vitest'

import { ACTUAL_SIZE_SCALE, FRAME_PADDING_PX, MAX_SCALE, MIN_SCALE, fitScaleFor, zoomIn, zoomOut, zoomPercent } from './pdfPreview.utils'

describe('fitScaleFor', () => {
  it('scales the page so its width fills the frame inside the padding', () => {
    expect(fitScaleFor(816, 612)).toBeCloseTo((816 - 2 * FRAME_PADDING_PX) / 612, 10)
  })

  it('stays within the zoom limits', () => {
    expect(fitScaleFor(5000, 100)).toBe(MAX_SCALE)
    expect(fitScaleFor(100, 5000)).toBe(MIN_SCALE)
  })

  it.each([
    [0, 612],
    [816, 0],
    [Number.NaN, 612],
    [816, Number.POSITIVE_INFINITY],
    [2 * FRAME_PADDING_PX, 612]
  ])('falls back to 1 for a frame of %s px and a page of %s pt', (frameWidth, pageWidth) => {
    expect(fitScaleFor(frameWidth, pageWidth)).toBe(1)
  })
})

describe('zoomIn / zoomOut', () => {
  it('steps by a factor of 1.25', () => {
    expect(zoomIn(1)).toBeCloseTo(1.25, 10)
    expect(zoomOut(1)).toBeCloseTo(0.8, 10)
  })

  it('never leaves the zoom limits', () => {
    expect(zoomIn(MAX_SCALE)).toBe(MAX_SCALE)
    expect(zoomIn(3.9)).toBe(MAX_SCALE)
    expect(zoomOut(MIN_SCALE)).toBe(MIN_SCALE)
    expect(zoomOut(0.26)).toBe(MIN_SCALE)
  })
})

describe('zoomPercent', () => {
  it('calls the printed size of the page 100%', () => {
    expect(zoomPercent(ACTUAL_SIZE_SCALE)).toBe('100%')
  })

  it('rounds to whole percent', () => {
    expect(zoomPercent(1)).toBe('75%')
    expect(zoomPercent(MAX_SCALE)).toBe('300%')
    expect(zoomPercent(MIN_SCALE)).toBe('19%')
  })
})
