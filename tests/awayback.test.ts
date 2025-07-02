import { beforeEach, describe, expect, it, vi } from 'vitest'
import awayback from '../src/awayback'

type TestEvents = {
  foo: (data: string) => void
  bar: (x: number, y: number) => void
  arr: (arr: string[]) => void
  noargs: () => void
}

describe('awayback', () => {
  let events: ReturnType<typeof awayback<TestEvents>>

  beforeEach(() => {
    events = awayback<TestEvents>()
  })

  it('should only call .only listener if it is the only listener and no previous calls', () => {
    const handler = vi.fn()
    events.only('foo', handler)
    events.emit('foo', 'data1')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('data1')
    const handler2 = vi.fn()
    events.only('foo', handler2)
    events.emit('foo', 'data2')
    expect(handler2).not.toHaveBeenCalled()
    const handler3 = vi.fn()
    events.on('foo', handler3)
    const handler4 = vi.fn()
    events.only('foo', handler4)
    events.emit('foo', 'data3')
    expect(handler4).not.toHaveBeenCalled()
    expect(handler3).toHaveBeenCalledWith('data3')
  })
  it('should not prevent other listeners if one throws', () => {
    const handler1 = vi.fn(() => {
      throw new Error('fail')
    })
    const handler2 = vi.fn()
    events.on('foo', handler1)
    events.on('foo', handler2)
    events.emit('foo', 'err')
    expect(handler2).toHaveBeenCalledWith('err')
  })

  it('should allow registering a listener with isExecutingPrevious during replay', () => {
    const calls: string[] = []
    events.emit('foo', 'a')
    events.on(
      'foo',
      () => {
        calls.push('first')
        events.on('foo', () => calls.push('second'), { isExecutingPrevious: true })
      },
      { isExecutingPrevious: true }
    )
    expect(calls).toEqual(['first', 'second'])
  })

  it('should only reject .promise once if both timeout and reject event occur', async () => {
    const p = events.promise('foo', { timeout: 10, reject: ['bar'] })
    events.emit('bar', 1, 2)
    await expect(p).rejects.toThrow()
  })

  it('should not break if predicate throws', () => {
    const handler = vi.fn()
    events.on('foo', handler, {
      predicate: () => {
        throw new Error('predicate fail')
      },
    })
    expect(() => events.emit('foo', 'x')).toThrow('predicate fail')

    expect(handler).not.toHaveBeenCalled()
  })

  it('should not call handler if rapidly aborted and emitted', () => {
    const handler = vi.fn()
    const controller = new AbortController()
    events.on('foo', handler, { signal: controller.signal })
    controller.abort()
    for (let i = 0; i < 10; i++) {
      events.emit('foo', 'x')
    }
    expect(handler).not.toHaveBeenCalled()
  })

  it('should stop calling listeners if destroy is called during emit', () => {
    const handler1 = vi.fn(() => events.destroy())
    const handler2 = vi.fn()
    events.on('foo', handler1)
    events.on('foo', handler2)
    events.emit('foo', 'x')

    expect(handler1).toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })

  it('should support a predicate that changes its return value', () => {
    let allow = false
    const handler = vi.fn()
    events.on('foo', handler, { predicate: () => allow })
    events.emit('foo', 'a')
    allow = true
    events.emit('foo', 'b')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('b')
  })

  it('should call .on listeners when event is emitted', () => {
    const handler = vi.fn()
    events.on('foo', handler)
    events.emit('foo', 'test')
    expect(handler).toHaveBeenCalledWith('test')
  })

  it('should call .once listeners only once', () => {
    const handler = vi.fn()
    events.once('foo', handler)
    events.emit('foo', 'one')
    events.emit('foo', 'two')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('one')
  })

  it('should call .only listener only if it is the only one', () => {
    const handler = vi.fn()
    events.only('foo', handler)
    events.emit('foo', 'data')
    expect(handler).toHaveBeenCalledWith('data')
  })

  it('should not call .only listener if another listener exists', () => {
    const handler = vi.fn()
    const other = vi.fn()
    events.on('foo', other)
    events.only('foo', handler)
    events.emit('foo', 'data')
    expect(handler).not.toHaveBeenCalled()
    expect(other).toHaveBeenCalledWith('data')
  })

  it('should support predicate option for .on', () => {
    const handler = vi.fn()
    events.on('foo', handler, { predicate: (data) => data === 'ok' })
    events.emit('foo', 'fail')
    events.emit('foo', 'ok')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('ok')
  })

  it('should support predicate option for .once', () => {
    const handler = vi.fn()
    events.once('foo', handler, { predicate: (data) => data === 'ok' })
    events.emit('foo', 'fail')
    events.emit('foo', 'ok')
    events.emit('foo', 'ok')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('ok')
  })

  it('should support predicate option for .only', () => {
    const handler = vi.fn()
    events.only('foo', handler, { predicate: (data) => data === 'ok' })
    events.emit('foo', 'fail')
    events.emit('foo', 'ok')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('ok')
  })

  it('should support AbortSignal for .on', () => {
    const handler = vi.fn()
    const controller = new AbortController()
    events.on('foo', handler, { signal: controller.signal })
    events.emit('foo', 'before')
    controller.abort()
    events.emit('foo', 'after')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('before')
  })

  it('should support isExecutingPrevious for .on', () => {
    const handler = vi.fn()
    events.emit('foo', 'before')
    events.on('foo', handler, { isExecutingPrevious: true })
    events.emit('foo', 'after')
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenNthCalledWith(1, 'before')
    expect(handler).toHaveBeenNthCalledWith(2, 'after')
  })

  it('should support isExecutingPrevious for .once', () => {
    const handler = vi.fn()
    events.emit('foo', 'before')
    events.once('foo', handler, { isExecutingPrevious: true })
    events.emit('foo', 'after')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('before')
  })

  it('should support isExecutingPrevious for .only', () => {
    const handler = vi.fn()
    events.emit('foo', 'before')
    events.only('foo', handler, { isExecutingPrevious: true })
    events.emit('foo', 'after')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenNthCalledWith(1, 'before')
  })

  it('should remove listeners with .remove', () => {
    const handler = vi.fn()
    events.on('foo', handler)
    events.remove('foo', handler)
    events.emit('foo', 'data')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should allow multiple listeners for the same event and call all', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    events.on('foo', handler1)
    events.on('foo', handler2)
    events.emit('foo', 'multi')
    expect(handler1).toHaveBeenCalledWith('multi')
    expect(handler2).toHaveBeenCalledWith('multi')
  })

  it('should allow removing one of multiple listeners', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    events.on('foo', handler1)
    events.on('foo', handler2)
    events.remove('foo', handler1)
    events.emit('foo', 'multi')
    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalledWith('multi')
  })

  it('should support nested emits (reentrant emits)', () => {
    const handler = vi.fn()
    events.on('foo', (data) => {
      handler(data)
      if (data === 'first') {
        events.emit('foo', 'second')
      }
    })
    events.emit('foo', 'first')
    expect(handler).toHaveBeenNthCalledWith(1, 'first')
    expect(handler).toHaveBeenNthCalledWith(2, 'second')
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('should support listeners for different events independently', () => {
    const fooHandler = vi.fn()
    const barHandler = vi.fn()
    events.on('foo', fooHandler)
    events.on('bar', barHandler)
    events.emit('foo', 'f')
    events.emit('bar', 1, 2)
    expect(fooHandler).toHaveBeenCalledWith('f')
    expect(barHandler).toHaveBeenCalledWith(1, 2)
  })

  it('should not leak listeners after destroy', () => {
    const handler = vi.fn()
    events.on('foo', handler)
    events.destroy()
    events.emit('foo', 'data')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should support multiple abort signals for a listener (any aborts)', () => {
    const handler = vi.fn()
    const c1 = new AbortController()
    const c2 = new AbortController()
    events.on('foo', handler, { signal: c1.signal })
    events.on('foo', handler, { signal: c2.signal })
    events.emit('foo', 'before')
    c1.abort()
    events.emit('foo', 'after')
    c2.abort()
    events.emit('foo', 'final')

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenNthCalledWith(2, 'before')
    expect(handler).not.toHaveBeenCalledWith('after')
    expect(handler).not.toHaveBeenCalledWith(0, 'final')
  })

  it('should support listeners with complex predicates', () => {
    const handler = vi.fn()
    events.on('bar', handler, { predicate: (x, y) => x + y > 10 })
    events.emit('bar', 3, 4)
    events.emit('bar', 6, 6)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(6, 6)
  })

  it('should support listeners that remove themselves', () => {
    const handler = vi.fn(() => events.remove('foo', handler))
    events.on('foo', handler)
    events.emit('foo', 'a')
    events.emit('foo', 'b')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('a')
  })

  it('should support listeners that add new listeners during emit', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    events.on('foo', () => {
      handler1()
      events.on('foo', handler2)
    })
    events.emit('foo', 'x')
    events.emit('foo', 'y')
    expect(handler1).toHaveBeenCalledTimes(2)
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('should clear all listeners and timeouts with .destroy', () => {
    const handler = vi.fn()
    events.on('foo', handler)
    events.emit('foo', 'data')
    events.destroy()
    events.emit('foo', 'data2')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should support .promise resolving on event', async () => {
    const p = events.promise('foo')
    events.emit('foo', 'data')
    await expect(p).resolves.toEqual(['data'])
  })

  it('should support .promise rejecting on timeout', async () => {
    const p = events.promise('foo', { timeout: 10 })
    await expect(p).rejects.toThrow(/timeout/)
  })

  it('should support .promise rejecting on reject event', async () => {
    const p = events.promise('foo', { reject: ['bar'] })
    events.emit('bar', 1, 2)
    await expect(p).rejects.toThrow(/rejected due to "bar"/)
  })

  it('should pass all arguments to listeners', () => {
    const handler = vi.fn()
    events.on('bar', handler)
    events.emit('bar', 1, 2)
    expect(handler).toHaveBeenCalledWith(1, 2)
  })

  it('should support array arguments', () => {
    const handler = vi.fn()
    events.on('arr', handler)
    events.emit('arr', ['a', 'b'])
    expect(handler).toHaveBeenCalledWith(['a', 'b'])
  })

  it('should support no-argument events', () => {
    const handler = vi.fn()
    events.on('noargs', handler)
    events.emit('noargs')
    expect(handler).toHaveBeenCalled()
  })

  it('should not call listeners after AbortSignal is aborted before registration', () => {
    const handler = vi.fn()
    const controller = new AbortController()
    controller.abort()
    events.on('foo', handler, { signal: controller.signal })
    events.emit('foo', 'data')
    expect(handler).not.toHaveBeenCalled()
  })

  it('should not call listeners if predicate returns false for isExecutingPrevious', () => {
    const handler = vi.fn()
    events.emit('foo', 'no')
    events.on('foo', handler, { isExecutingPrevious: true, predicate: (d) => d === 'yes' })
    events.emit('foo', 'yes')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('yes')
  })

  it('should not call .once listener for isExecutingPrevious if predicate returns false', () => {
    const handler = vi.fn()
    events.emit('foo', 'no')
    events.once('foo', handler, { isExecutingPrevious: true, predicate: (d) => d === 'yes' })
    events.emit('foo', 'yes')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('yes')
  })

  it('should not call .only listener for isExecutingPrevious if predicate returns false', () => {
    const handler = vi.fn()
    events.emit('foo', 'no')
    events.only('foo', handler, { isExecutingPrevious: true, predicate: (d) => d === 'yes' })
    events.emit('foo', 'yes')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('yes')
  })

  it('should not call .only if another listener has already been called', () => {
    const handler = vi.fn()
    const other = vi.fn()
    events.on('foo', other)
    events.emit('foo', 'data')
    events.only('foo', handler)
    events.emit('foo', 'data2')
    expect(handler).not.toHaveBeenCalled()
    expect(other).toHaveBeenCalledWith('data')
  })

  it('should not throw if removing a handler from an event that does not exist', () => {
    expect(() => events.remove('foo', () => {})).not.toThrow()
  })

  it('should not throw if emitting an event that does not exist', () => {
    // @ts-expect-error Testing non-existent event
    expect(() => events.emit('idontexist', 'data')).not.toThrow()
  })
})
