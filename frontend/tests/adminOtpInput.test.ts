import test from 'node:test'
import assert from 'node:assert/strict'

import {
  applyAdminOtpBackspace,
  applyAdminOtpInput,
  createEmptyAdminOtp,
} from '../src/admin/pages/adminOtpInput.ts'

test('otp input writes one digit and focuses the next cell', () => {
  const result = applyAdminOtpInput(createEmptyAdminOtp(), 0, '7')

  assert.deepEqual(result.otp, ['7', '', '', '', '', ''])
  assert.equal(result.focusIndex, 1)
})

test('otp input ignores non numeric characters', () => {
  const result = applyAdminOtpInput(['1', '', '', '', '', ''], 1, 'a')

  assert.deepEqual(result.otp, ['1', '', '', '', '', ''])
  assert.equal(result.focusIndex, 1)
})

test('otp input can distribute pasted digits from the current cell', () => {
  const result = applyAdminOtpInput(createEmptyAdminOtp(), 2, '3456')

  assert.deepEqual(result.otp, ['', '', '3', '4', '5', '6'])
  assert.equal(result.focusIndex, 5)
})

test('backspace clears the current populated cell and keeps focus there', () => {
  const result = applyAdminOtpBackspace(['1', '2', '3', '', '', ''], 2)

  assert.deepEqual(result.otp, ['1', '2', '', '', '', ''])
  assert.equal(result.focusIndex, 2)
})

test('backspace from an empty cell clears the previous cell and moves focus back', () => {
  const result = applyAdminOtpBackspace(['1', '2', '', '', '', ''], 2)

  assert.deepEqual(result.otp, ['1', '', '', '', '', ''])
  assert.equal(result.focusIndex, 1)
})
