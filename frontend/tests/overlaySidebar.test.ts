import test from 'node:test'
import assert from 'node:assert/strict'

import { getOverlaySidebarPresentation } from '../src/components/layout/overlaySidebarState.ts'

test('closed overlay sidebar stays off canvas without changing page width', () => {
  assert.deepEqual(getOverlaySidebarPresentation(false), {
    panel: '-translate-x-full',
    backdrop: 'pointer-events-none opacity-0',
    expanded: false,
  })
})

test('open overlay sidebar covers the page and exposes its backdrop', () => {
  assert.deepEqual(getOverlaySidebarPresentation(true), {
    panel: 'translate-x-0',
    backdrop: 'pointer-events-auto opacity-100',
    expanded: true,
  })
})
