import { describe, expect, it } from 'vitest'
import { normalizeXfyunErrorMessage } from './xfyunRtasr'

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

  it('returns the original message for unknown errors', () => {
    expect(normalizeXfyunErrorMessage('random failure')).toBe('random failure')
  })
})
