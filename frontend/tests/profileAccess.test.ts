import test from 'node:test'
import assert from 'node:assert/strict'

import { getProfileAccessState } from '../src/pages/profileAccess.ts'

test('approved application is fully read only', () => {
  const access = getProfileAccessState('APPROVED')

  assert.equal(access.canEditProfile, false)
  assert.equal(access.canUploadDocuments, false)
  assert.equal(access.canSubmitDocuments, false)
  assert.equal(access.isReadOnly, true)
})

test('lottery qualified application is fully read only', () => {
  const access = getProfileAccessState('LOTTERY_QUALIFIED')

  assert.equal(access.canEditProfile, false)
  assert.equal(access.canUploadDocuments, false)
  assert.equal(access.canSubmitDocuments, false)
  assert.equal(access.isReadOnly, true)
})

test('rejected application can be edited and resubmitted', () => {
  const access = getProfileAccessState('REJECTED')

  assert.equal(access.canEditProfile, true)
  assert.equal(access.canUploadDocuments, true)
  assert.equal(access.canSubmitDocuments, true)
  assert.equal(access.isReadOnly, false)
})

test('under review application is temporarily read only', () => {
  const access = getProfileAccessState('UNDER_REVIEW')

  assert.equal(access.canEditProfile, false)
  assert.equal(access.canUploadDocuments, false)
  assert.equal(access.canSubmitDocuments, false)
  assert.equal(access.isReadOnly, true)
})
