import test from 'node:test'
import assert from 'node:assert/strict'

import { getRowNumber } from '../src/components/common/rowNumber.ts'

test('getRowNumber continues numbering across pages', () => {
  assert.equal(getRowNumber(0, 10, 0), 1)
  assert.equal(getRowNumber(1, 10, 0), 11)
  assert.equal(getRowNumber(2, 5, 4), 15)
})
