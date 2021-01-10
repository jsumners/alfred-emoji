'use strict'

const test = require('tap').test
const {
  getRandomSkinTone,
  NUM_SKIN_TONES
} = require('../src/utils')

test(`getRandomSkinTone() generares a number between 0 and ${NUM_SKIN_TONES - 1}`, (t) => {
  t.plan(1)
  t.ok([0, 1, 2, 3, 4].includes(getRandomSkinTone()))
})
