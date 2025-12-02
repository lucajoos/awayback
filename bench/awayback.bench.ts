import { performance } from 'node:perf_hooks'
import awayback from '../src/awayback.ts'

type Events = {
  ping: (n: number) => void
  pong: (msg: string) => void
  reject: () => void
}

const RUNS = 100_000

function bench(label: string, fn: () => void | Promise<void>) {
  const start = performance.now()
  const result = fn()

  if (result instanceof Promise) {
    return result.then(() => {
      const end = performance.now()
      const delta = (end - start).toFixed(2)
      console.log(`${label.padEnd(40)} ${delta} ms`)
    })
  } else {
    const end = performance.now()
    const delta = (end - start).toFixed(2)
    console.log(`${label.padEnd(40)} ${delta} ms`)
  }
}

async function listenerRegistrationBench() {
  console.log('\n--- Listener registration ---')

  const bus = awayback<Events>()

  bench('register 100k on listeners', () => {
    for (let i = 0; i < RUNS; i++) {
      bus.on('ping', () => {})
    }
  })

  bench('register 100k once listeners', () => {
    for (let i = 0; i < RUNS; i++) {
      bus.once('ping', () => {})
    }
  })

  bench('register 100k only listeners', () => {
    for (let i = 0; i < RUNS; i++) {
      bus.only('ping', () => {})
    }
  })

  bus.destroy()
}

async function emissionBench() {
  console.log('\n--- Emission performance ---')

  const bus = awayback<Events>()

  let counter = 0

  for (let i = 0; i < 1_000; i++) {
    bus.on('ping', () => {
      counter++
    })
  }

  bench('emit 100k events to 1k listeners', () => {
    for (let i = 0; i < RUNS; i++) {
      bus.emit('ping', i)
    }
  })

  console.log('Total executions:', counter)
  bus.destroy()
}

async function onceOnlyBench() {
  console.log('\n--- Once/Only stress test ---')

  const bus = awayback<Events>()

  for (let i = 0; i < 1_000; i++) {
    bus.once('ping', () => {})
    bus.only('ping', () => {})
  }

  bench('emit 10k events with once/only', () => {
    for (let i = 0; i < 10_000; i++) {
      bus.emit('ping', i)
    }
  })

  bus.destroy()
}

async function replayAndPromiseBench() {
  console.log('\n--- Replay + Promise ---')

  const bus = awayback<Events, ['ping']>(['ping'])

  // Pre-fill replay history
  for (let i = 0; i < 10_000; i++) {
    bus.emit('ping', i)
  }

  bench('replay 10k events on new listener', () => {
    bus.on('ping', () => {}, { isReplaying: true })
  })

  await bench('1000 promise waits (resolve)', async () => {
    const jobs: Promise<unknown>[] = []

    for (let i = 0; i < 1_000; i++) {
      jobs.push(bus.promise('pong'))
    }

    for (let i = 0; i < 1_000; i++) {
      bus.emit('pong', 'ok')
    }

    await Promise.all(jobs)
  })

  await bench('1000 promise waits (timeout)', async () => {
    const jobs: Promise<unknown>[] = []

    for (let i = 0; i < 1_000; i++) {
      jobs.push(bus.promise('pong', { timeout: 1 }).catch(() => {}))
    }

    await Promise.all(jobs)
  })

  bus.destroy()
}

async function run() {
  console.log('\n🧪 Awayback benchmark starting...\n')

  await listenerRegistrationBench()
  await emissionBench()
  await onceOnlyBench()
  await replayAndPromiseBench()

  console.log('\n✅ Benchmarks completed\n')
}

run()
