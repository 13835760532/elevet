import { describe, expect, it } from 'vitest'
import { downsampleBuffer } from './audioBus'

describe('downsampleBuffer', () => {
  it('returns the same reference when sample rates are equal', () => {
    const input = new Float32Array([0.1, 0.2, 0.3])

    const result = downsampleBuffer(input, 16000, 16000)

    expect(result).toBe(input)
  })

  it('downsamples by averaging source windows', () => {
    const input = new Float32Array([1, 3, 5, 7])

    const result = downsampleBuffer(input, 32000, 16000)

    expect(Array.from(result)).toEqual([2, 6])
  })

  it('handles uneven window boundaries without producing empty buckets', () => {
    const input = new Float32Array([2, 4, 6, 8, 10, 12])

    const result = downsampleBuffer(input, 48000, 16000)

    expect(Array.from(result)).toEqual([4, 10])
  })
})
