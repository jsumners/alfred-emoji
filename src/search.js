'use strict'

const emojiData = require('./emoji.pack.json')
const {
  keywords: emojiKeywords,
  emoji: emojiInfo,
  searchTerms,
  orderedEmoji,
  emojiComponents
} = emojiData

// compatability layer:
const modifiers = [
  emojiComponents.light_skin_tone,
  emojiComponents.medium_light_skin_tone,
  emojiComponents.medium_skin_tone,
  emojiComponents.medium_dark_skin_tone,
  emojiComponents.dark_skin_tone
]

let skinTone
let modifier

const setSkinToneModifier = (tone) => {
  skinTone = tone
  modifier = skinTone ? modifiers[skinTone] : null
}

const addModifier = (emoji, char, modifier) => {
  if (!modifier || !emoji.skin_tone_support) return char

  /*
  * There are some emojis categorized as a sequence of emojis
  * Emoji ZWJ Sequence is a combination of multiple emojis which display as a single emoji
  * on supported platforms. These sequences are joined with a Zero Width Joiner character.
  *
  * https://emojipedia.org/emoji-zwj-sequence/
  */

  const zwj = new RegExp('‍', 'g') // eslint-disable-line
  return char.match(zwj) ? char.replace(zwj, modifier + '‍') : char + modifier
}

const getIconName = (emoji) => {
  if (emoji.skin_tone_support && skinTone && skinTone >= 0 && skinTone < 5) {
    return `${emoji.slug}_${skinTone}`
  }
  return emoji.slug
}

const getSubtitleStrings = (operationType) => {
  switch (operationType) {
    case 'snippet':
      return {verb: 'Paste', preposition: 'as snippet'}
    case 'autopaste':
      return {verb: 'Paste', preposition: 'into frontmost application'}
    case 'clipboard':
    default:
      return {verb: 'Copy', preposition: 'to clipboard'}
  }
}

const alfredItem = (emojiDetails, emojiSymbol, operationType = 'clipboard') => {
  if (emojiDetails === undefined) {
    // Can happen when `char` references an emoji the system does not
    // recognize. This happens with newer Unicode data sets being used on
    // older macOS releases.
    return
  }
  const modifiedEmoji = addModifier(emojiDetails, emojiSymbol, modifier)
  const icon = getIconName(emojiDetails)
  const name = emojiDetails.name

  const {verb, preposition} = getSubtitleStrings(operationType)

  return {
    uid: name,
    title: name,
    subtitle: `${verb} "${modifiedEmoji}" (${name}) ${preposition}`,
    arg: modifiedEmoji,
    autocomplete: name,
    icon: { path: `./icons/${icon}.png` },
    mods: {
      // copy a code for the emoji, e.g. :thumbs_down:
      alt: {
        subtitle: `${verb} ":${emojiDetails.slug}:" (${emojiSymbol}) ${preposition}`,
        arg: `:${emojiDetails.slug}:`,
        icon: { path: `./icons/${emojiDetails.slug}.png` }
      },
      // copy the default symbol for the emoji, without skin tones
      shift: {
        subtitle: `${verb} "${emojiSymbol}" (${name}) ${preposition}`,
        arg: emojiSymbol,
        icon: { path: `./icons/${emojiDetails.slug}.png` }
      }
    }
  }
}

const alfredItems = (chars, operationType = 'clipboard') => {
  const items = []
  chars.forEach((char) => {
    items.push(alfredItem(emojiInfo[char], char, operationType))
  })
  return { items }
}

const all = (operationType = 'clipboard') => alfredItems(orderedEmoji, operationType)

const matches = (terms) => {
  const result = []
  for (const term of terms) {
    const foundTerms = searchTerms.filter(searchTerm => searchTerm.includes(term))
    foundTerms.forEach(foundTerm => {
      Array.prototype.push.apply(result, emojiKeywords[foundTerm])
    })
  }
  return new Set(result)
}

// :thumbs up: => ['thumbs', 'up']
const parse = query => query.replace(/[:]/g, '').split(/\s+/)

module.exports = function search (query, skinTone, operationType = 'clipboard') {
  setSkinToneModifier(skinTone)

  if (!query) return all(operationType)

  const terms = parse(query)

  return alfredItems(matches(terms), operationType)
}
