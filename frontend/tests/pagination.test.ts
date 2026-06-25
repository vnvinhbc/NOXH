import test from 'node:test'
import assert from 'node:assert/strict'

import { clampPage, getPageItems, getPaginationItems } from '../src/components/common/pagination.ts'

test('clampPage keeps the current page inside the available range', () => {
  assert.equal(clampPage(4, 12, 5), 2)
  assert.equal(clampPage(-1, 12, 5), 0)
  assert.equal(clampPage(3, 0, 5), 0)
})

test('getPageItems returns the requested page using the selected limit', () => {
  const records = Array.from({ length: 12 }, (_, index) => index + 1)

  assert.deepEqual(getPageItems(records, 1, 5), [6, 7, 8, 9, 10])
  assert.deepEqual(getPageItems(records, 1, 10), [11, 12])
})

test('getPaginationItems shows nearby pages and ellipses for long lists', () => {
  assert.deepEqual(getPaginationItems(0, 3), [0, 1, 2])
  assert.deepEqual(getPaginationItems(4, 10), [0, 'ellipsis-left', 3, 4, 5, 'ellipsis-right', 9])
  assert.deepEqual(getPaginationItems(8, 10), [0, 'ellipsis-left', 7, 8, 9])
})
