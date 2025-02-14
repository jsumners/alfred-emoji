'use strict'

const test = require('node:test')
const search = require('../src/search')

test('does not include null results', (t) => {
  t.plan(1)
  const found = search('')
  const filtered = found.items.filter(i => i == null)
  t.assert.equal(filtered.length, 0)
})

test('finds "thumbs up"', (t) => {
  t.plan(1)
  const found = search('thumbs up')
  t.assert.ok(Object.keys(found.items).length > 0)
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
  t.assert.ok(Object.keys(found.items).length > 0)
})

test('does not throw when emoji is in orderedList but not in emojiLib', (t) => {
  t.plan(1)
  const found = search('baz')
  t.assert.ok(Object.keys(found.items).length === 0)
})

test('finds "thumbs up" when "pasteByDefault" is enabled', (t) => {
  t.plan(1)
  const found = search('thumbs up', 1, true)
  t.assert.ok(Object.keys(found.items).length > 0)
})

test('finds ALL results when no query is provided', (t) => {
  t.plan(1)
  const found = search()
  t.assert.ok(Object.keys(found.items).length > 0)
})

test('finds "thu" partial', (t) => {
  t.plan(1)
  const found = search('thu')
  t.assert.ok(Object.keys(found.items).length > 4)
})

test('finds "vomit" keyword', (t) => {
  t.plan(1)
  const found = search('vomit')
  t.assert.ok(Object.keys(found.items).length > 0)
})

test('omits "rage1"', (t) => {
  t.plan(1)
  const found = search('rage1')
  t.assert.ok(Object.keys(found.items).length === 0)
})

test('applies modifier if possible', (t) => {
  t.plan(1)
  const found = search('a', 1)
  t.assert.ok(Object.keys(found.items).length > 0)
})

test('enables uid', (t) => {
  t.plan(1)
  const found = search('grimacing')
  t.assert.ok(found.items[0].uid === 'grimacing face')
})

test('enables autocomplete', (t) => {
  t.plan(1)
  const found = search('think')
  t.assert.ok(found.items[0].autocomplete === 'thinking face')
})

test('enables alt-modifier', (t) => {
  t.plan(1)
  const found = search('hear_no_evil')
  t.assert.ok(found.items[0].mods.alt.arg === ':hear_no_evil_monkey:')
})

test('unique results', (t) => {
  t.plan(1)
  const found = search('smile')
  const names = found.items.map(item => item.title)
  const set = new Set(names)
  t.assert.ok(names.length === set.size)
})

test('finds "open book"', (t) => {
  t.plan(1)
  const found = search('open book')
  t.assert.equal(found.items.filter(i => i.title === 'open book').length, 1)
})

test('finds "book open"', (t) => {
  t.plan(1)
  const found = search('book open')
  t.assert.equal(found.items.filter(i => i.title === 'open book').length, 1)
})

test('finds "plant nature"', (t) => {
  t.plan(1)
  const found = search('plant nature')
  t.assert.ok(Object.keys(found.items).length > 0)
})

test('finds "fruit banana"', (t) => {
  t.plan(1)
  const found = search('fruit banana')
  t.assert.ok(Object.keys(found.items).length > 0)
})

test('finds "teddy bear (macOS 10.14.1 / iOS 12.1)"', (t) => {
  t.plan(1)
  const found = search('teddy bear')
  t.assert.ok(Object.keys(found.items).length > 0)
})

test('finds "+1" null skin tone', (t) => {
  t.plan(1)
  const found = search('+1', null)
  t.assert.ok(found.items[0].arg === '👍')
})

test('finds "+1" medium skin tone', (t) => {
  t.plan(1)
  const found = search('+1', 2)
  t.assert.ok(found.items[0].arg === '👍🏽')
})

test('finds "+1" invalid skin tone', (t) => {
  t.plan(1)
  const found = search('+1', 5)
  t.assert.ok(found.items[0].arg === '👍')
})

test('enables "+1" shift-modifier neutral skin tone', (t) => {
  t.plan(1)
  const found = search('+1', 2)
  t.assert.ok(found.items[0].mods.shift.arg === '👍')
})

test('finds "+1" with random skin tone', (t) => {
  t.plan(1)
  const found = search('+1', 'random')
  t.assert.ok(
    [
      '👍',
      '👍🏻',
      '👍🏽',
      '👍🏾',
      '👍🏿'
    ].includes(found.items[0].arg)
  )
})

test('finds "unicorn" (ignore skin tone)', (t) => {
  t.plan(1)
  const found = search('unicorn', 2)
  t.assert.ok(found.items[0].arg === '🦄')
})

test('finds "unicorn" (ignore "random" skin tone)', (t) => {
  t.plan(1)
  const found = search('unicorn', 'random')
  t.assert.ok(found.items[0].arg === '🦄')
})

test('finds multiple "wink" emoji', (t) => {
  t.plan(1)
  const found = search('wink')
  t.assert.equal(found.items.length, 2)
})

test('finds 👨‍👩‍👦', (t) => {
  t.plan(1)
  const found = search('family')
  t.assert.equal(found.items.filter(i => i.title === 'family man, woman, boy').length, 1)
})

test('handles emoji the system does not recognize', (t) => {
  t.plan(1)
  const item = search.internals.alfredItem(undefined, '🤷🏼')
  t.assert.equal(item, undefined)
})

test('enables ctrl-modifier', (t) => {
  t.plan(1)
  const found = search('hear_no_evil')
  t.assert.ok(found.items[0].mods.ctrl.arg === 'U+1F649')
})

test('pads codepoint with zeroes if needed', (t) => {
  t.plan(1)
  const found = search('5')
  const unicodes = found.items.map((item) => item.mods.ctrl.arg)
  t.assert.ok(unicodes.includes('U+0035'))
})

test('"crossed" returns reasonable list', (t) => {
  t.plan(1)
  const found = search('crossed')
  const expected = [
    '😵', '🚫', '🔀', '🤞', '⚔️',
    '🎌', '🫰'
  ]
  const filtered = found.items.map(item => item.arg)
  t.assert.deepStrictEqual(filtered, expected)
})

test('"crossed fingers" returns reasonable list', (t) => {
  t.plan(1)
  const found = search('crossed fingers')
  const expected = [
    '😵', '🚫', '🔀', '🤞', '⚔️',
    '🎌', '🫰', '🤚', '🖐️', '✋',
    '🖖', '👌', '✌️', '🤟', '🤘',
    '👈', '👉', '👆', '🖕', '👇',
    '☝️', '✊', '👐', '💅', '🤌'
  ]
  const filtered = found.items.map(item => item.arg)
  t.assert.deepStrictEqual(filtered, expected)
})
