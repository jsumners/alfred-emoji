'use strict'

const emojiData = require('./unpack-emoji')()
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

let verb = 'Copy'
let preposition = 'to clipboard'

const resetWordsForPasteByDefault = () => {
  verb = 'Paste'
  preposition = 'as snippet'
}

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

const alfredItem = (emoji, char) => {
  if (emoji === undefined) {
    // Can happen when `char` references an emoji the system does not
    // recognize. This happens with newer Unicode data sets being used on
    // older macOS releases.
    return
  }
  const modifiedEmoji = addModifier(emoji, char, modifier)
  const icon = getIconName(emoji)
  const name = emoji.name
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
        subtitle: `${verb} ":${emoji.slug}:" (${char}) ${preposition}`,
        arg: `:${emoji.slug}:`,
        icon: { path: `./icons/${emoji.slug}.png` }
      },
      // copy the default symbol for the emoji, without skin tones
      shift: {
        subtitle: `${verb} "${char}" (${name}) ${preposition}`,
        arg: char,
        icon: { path: `./icons/${emoji.slug}.png` }
      }
    }
  }
}

const alfredItems = (chars) => {
  const items = []
  chars.forEach((char) => {
    items.push(alfredItem(emojiInfo.get(char), char))
  })
  return { items }
}

const all = () => alfredItems(orderedEmoji)

const matches = (terms) => {
  const result = []
  for (const term of terms) {
    if (emojiKeywords.has(term)) {
      Array.prototype.push.apply(result, emojiKeywords.get(term))
      continue
    }
    const foundTerms = searchTerms.filter(searchTerm => searchTerm.includes(term))
    foundTerms.forEach(foundTerm => {
      Array.prototype.push.apply(result, emojiKeywords.get(foundTerm))
    })
  }
  return new Set(result)
}

// :thumbs up: => ['thumbs', 'up']
const parse = query => query.replace(/[:]/g, '').split(/\s+/)

module.exports = function search (query, skinTone, pasteByDefault = false) {
  if (pasteByDefault) resetWordsForPasteByDefault()

  setSkinToneModifier(skinTone)

  if (!query) return all()

  const terms = parse(query)

  return alfredItems(matches(terms))
}
