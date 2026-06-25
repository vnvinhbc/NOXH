import test from 'node:test'
import assert from 'node:assert/strict'

import { preloadUserProgress } from '../src/api/sessionPreload.ts'

test('preloadUserProgress warms both progress queries after login', async () => {
  const calls: Array<{ key: readonly string[]; value: string }> = []

  await preloadUserProgress(async (key, loader) => {
    calls.push({ key, value: await loader() })
  }, async () => 'dashboard', async () => 'lottery')

  assert.deepEqual(calls, [
    { key: ['dashboard'], value: 'dashboard' },
    { key: ['userLotterySummary'], value: 'lottery' },
  ])
})
