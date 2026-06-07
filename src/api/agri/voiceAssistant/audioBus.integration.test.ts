import { beforeEach, describe, expect, it } from 'vitest'
import { sharedAudioBus } from './audioBus'

describe('sharedAudioBus listener lifecycle', () => {
  beforeEach(() => {
    sharedAudioBus.release()
  })

  it('tracks listeners and auto releases when the last listener is removed', () => {
    const listenerA = () => {}
    const listenerB = () => {}

    sharedAudioBus.addListener(listenerA)
    sharedAudioBus.addListener(listenerB)

    expect(sharedAudioBus.listenerCount()).toBe(2)

    sharedAudioBus.removeListener(listenerA)
    expect(sharedAudioBus.listenerCount()).toBe(1)

    sharedAudioBus.removeListener(listenerB)
    expect(sharedAudioBus.listenerCount()).toBe(0)
  })

  it('tolerates removing an unknown listener without going negative', () => {
    const listener = () => {}

    sharedAudioBus.removeListener(listener)

    expect(sharedAudioBus.listenerCount()).toBe(0)
  })
})
