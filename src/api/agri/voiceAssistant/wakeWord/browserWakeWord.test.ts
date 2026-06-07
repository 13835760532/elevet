import { describe, expect, it } from 'vitest'
import { DEFAULT_WAKE_WORDS, includesWakeWord } from './browserWakeWord'

describe('browser wake word matching', () => {
  it('matches default wake words in normalized browser transcripts', () => {
    expect(includesWakeWord('你好 小壹', DEFAULT_WAKE_WORDS)).toBe(true)
    expect(includesWakeWord('小壹小壹 帮我查询', DEFAULT_WAKE_WORDS)).toBe(true)
  })

  it('matches common same-sound browser transcripts for the wake word', () => {
    expect(includesWakeWord('你好小一', DEFAULT_WAKE_WORDS)).toBe(true)
    expect(includesWakeWord('小艺小艺', DEFAULT_WAKE_WORDS)).toBe(true)
  })

  it('does not match unrelated browser transcripts', () => {
    expect(includesWakeWord('帮我查询本月数据', DEFAULT_WAKE_WORDS)).toBe(false)
  })
})
