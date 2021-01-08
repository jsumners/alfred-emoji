'use strict'

const { test } = require('tap')
const mock = require('mock-require')
mock('emojilib', {
  lib: require('./emojisMock.json'),
  ordered: require('./orderedMock.json'),
  fitzpatrick_scale_modifiers: ['🏻', '🏼', '🏽', '🏾', '🏿']
})

const search = require('../src/search')

test('finds "thumbs up"', (t) => {
  t.plan(1)
  const found = search('thumbs up')
  t.ok(Object.keys(found.items).length > 0)
})

/*
* There are some emojis categorized as a sequence of emojis
* Emoji ZWJ Sequence is a combination of multiple emojis which display as a single emoji
* on supported platforms. These sequences are joined with a Zero Width Joiner character.
*
* https://emojipedia.org/emoji-zwj-sequence/
*/

test('finds emoji with zwj ("rockstar")', (t) => {
  t.plan(1)
  const found = search('rockstar', 2)
  t.ok(Object.keys(found.items).length > 0)
})

test('finds "thumbs up" when "pasteByDefault" is enabled', (t) => {
  t.plan(1)
  const found = search('thumbs up', 1, true)
  t.ok(Object.keys(found.items).length > 0)
})

test('finds ALL results when no query is provided', (t) => {
  t.plan(1)
  const found = search()
  t.ok(Object.keys(found.items).length > 0)
})

test('finds "thu" partial', (t) => {
  t.plan(1)
  const found = search('thu')
  t.ok(Object.keys(found.items).length > 4)
})

test('finds "vomit" keyword', (t) => {
  t.plan(1)
  const found = search('vomit')
  t.ok(Object.keys(found.items).length > 0)
})

test('omits "rage1"', (t) => {
  t.plan(1)
  const found = search('rage1')
  t.ok(Object.keys(found.items).length === 0)
})

test('applies modifier if possible', (t) => {
  t.plan(1)
  const found = search('a', 1)
  t.ok(Object.keys(found.items).length > 0)
})

test('enables uid', (t) => {
  t.plan(1)
  const found = search('grimacing')
  t.ok(found.items[0].uid === 'grimacing')
})

test('enables autocomplete', (t) => {
  t.plan(1)
  const found = search('think')
  t.ok(found.items[0].autocomplete === 'thinking')
})

test('enables alt-modifier', (t) => {
  t.plan(1)
  const found = search('hear_no_evil')
  t.ok(found.items[0].mods.alt.arg === ':hear_no_evil:')
})

test('unique results', (t) => {
  t.plan(1)
  const found = search('smile')
  const names = found.items.map(item => item.title)
  const set = new Set(names)
  t.ok(names.length === set.size)
})

test('finds "open book"', (t) => {
  t.plan(1)
  const found = search('open book')
  t.ok(found.items[0].title === 'open_book')
})

test('finds "book open"', (t) => {
  t.plan(1)
  const found = search('book open')
  t.ok(found.items[0].title === 'open_book')
})

test('finds "plant nature"', (t) => {
  t.plan(1)
  const found = search('plant nature')
  t.ok(Object.keys(found.items).length > 0)
})

test('finds "fruit banana"', (t) => {
  t.plan(1)
  const found = search('fruit banana')
  t.ok(Object.keys(found.items).length > 0)
})

test('finds "teddy bear (macOS 10.14.1 / iOS 12.1)"', (t) => {
  t.plan(1)
  const found = search('teddy bear')
  t.ok(Object.keys(found.items).length > 0)
})

test('finds "+1" null skin tone', (t) => {
  t.plan(1)
  const found = search('+1', null)
  t.ok(found.items[0].arg === '👍')
})

test('finds "+1" medium skin tone', (t) => {
  t.plan(1)
  const found = search('+1', 2)
  t.ok(found.items[0].arg === '👍🏽')
})

test('finds "+1" invalid skin tone', (t) => {
  t.plan(1)
  const found = search('+1', 5)
  t.ok(found.items[0].arg === '👍')
})

test('enables "+1" shift-modifier neutral skin tone', (t) => {
  t.plan(1)
  const found = search('+1', 2)
  t.ok(found.items[0].mods.shift.arg === '👍')
})

test('finds "unicorn" (ignore skin tone)', (t) => {
  t.plan(1)
  const found = search('unicorn', 2)
  t.ok(found.items[0].arg === '🦄')
})
