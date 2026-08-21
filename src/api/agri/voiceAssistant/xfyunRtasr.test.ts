import { describe, expect, it } from 'vitest'
import { normalizeXfyunErrorMessage, parseResult } from './xfyunRtasr'

describe('normalizeXfyunErrorMessage', () => {
  it('maps authentication failures to a localized message', () => {
    expect(normalizeXfyunErrorMessage('illegal access')).toContain('鉴权失败')
  })

  it('maps license failures to a localized message', () => {
    expect(normalizeXfyunErrorMessage('10110 no license')).toContain('未开通')
  })

  it('maps whitelist failures to a localized message', () => {
    expect(normalizeXfyunErrorMessage('illegal client_ip')).toContain('白名单')
  })

  it('maps rejected service permissions to a localized message', () => {
    expect(normalizeXfyunErrorMessage('Permission denied (403)')).toContain('权限被拒绝')
  })

  it('returns the original message for unknown errors', () => {
    expect(normalizeXfyunErrorMessage('random failure')).toBe('random failure')
  })
})

describe('parseResult', () => {
  const message = (type: number, segId: number, text: string) => ({
    data: JSON.stringify({
      cn: {
        st: {
          type,
          seg_id: segId,
          rt: [{ ws: [{ cw: [{ w: text }] }] }]
        }
      }
    })
  }) as MessageEvent

  it('keeps interim and final segment metadata', () => {
    expect(parseResult(message(1, 4, '正在识别'))).toEqual({
      text: '正在识别',
      type: 'interim',
      segId: 4
    })
    expect(parseResult(message(0, 4, '识别完成'))).toEqual({
      text: '识别完成',
      type: 'final',
      segId: 4
    })
  })

  it('handles the started handshake without emitting text', () => {
    expect(parseResult({ data: JSON.stringify({ action: 'started' }) } as MessageEvent)).toMatchObject({
      action: 'started',
      text: ''
    })
  })
})
