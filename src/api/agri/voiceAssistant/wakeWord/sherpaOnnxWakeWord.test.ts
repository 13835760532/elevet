import { describe, expect, it } from 'vitest'
import { createKeywordLines, normalizeErrorMessage } from './sherpaOnnxWakeWord'

describe('createKeywordLines', () => {
  it('appends display aliases for plain keywords', () => {
    const result = createKeywordLines(['n ǐ h ǎo x iǎo y ī', 'x iǎo y ī x iǎo y ī'])

    expect(result).toBe(
      'n ǐ h ǎo x iǎo y ī @n ǐ h ǎo x iǎo y ī\nx iǎo y ī x iǎo y ī @x iǎo y ī x iǎo y ī'
    )
  })

  it('preserves preformatted keyword aliases and removes empty values', () => {
    const result = createKeywordLines(['  n ǐ h ǎo @你好  ', '', '   '])

    expect(result).toBe('n ǐ h ǎo @你好')
  })

  it('preserves the short desktop wake word', () => {
    expect(createKeywordLines(['x iǎo y ī @小一'])).toBe('x iǎo y ī @小一')
  })
})

describe('normalizeErrorMessage', () => {
  it('returns the original Error message when given an Error', () => {
    expect(normalizeErrorMessage(new Error('boom'))).toBe('boom')
  })

  it('falls back to a generic message for non-Error values', () => {
    expect(normalizeErrorMessage('bad')).toBe('本地唤醒初始化失败')
  })
})
