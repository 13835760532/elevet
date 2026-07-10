import { describe, expect, it } from 'vitest'
import { BIG_SCREEN_AUTOFIT_OPTIONS } from './bigScreenAutofit'

const zoomViewports = [
  { width: 1958, height: 1152 },
  { width: 2176, height: 1280 },
  { width: 2448, height: 1440 }
]

const getLogicalHeight = ({ width, height }: (typeof zoomViewports)[number]) => {
  const designWidth = BIG_SCREEN_AUTOFIT_OPTIONS.dw ?? 1920
  const designHeight = BIG_SCREEN_AUTOFIT_OPTIONS.dh ?? 1080
  const limit = BIG_SCREEN_AUTOFIT_OPTIONS.limit ?? 0.1
  const rawScale =
    width / height < designWidth / designHeight ? width / designWidth : height / designHeight
  const scale = Math.abs(1 - rawScale) > limit ? rawScale : 1

  return Math.round(height / scale)
}

describe('big screen autofit options', () => {
  it('keeps the design height stable across browser zoom levels', () => {
    expect(zoomViewports.map(getLogicalHeight)).toEqual([1180, 1180, 1180])
  })
})
