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

const alfredItem = (emojiDetails, emojiSymbol) => {
  if (emojiDetails === undefined) {
    // Can happen when `char` references an emoji the system does not
    // recognize. This happens with newer Unicode data sets being used on
    // older macOS releases.
    return
  }
  const modifiedEmoji = addModifier(emojiDetails, emojiSymbol, modifier)
  const icon = getIconName(emojiDetails)
  const name = emojiDetails.name
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
      },
      // copy the codepoint for the emoji
      ctrl: {
        subtitle: `${verb} "U+${emojiDetails.codepoint}" (${emojiSymbol}) ${preposition}`,
        arg: `U+${emojiDetails.codepoint}`,
        icon: { path: `./icons/${emojiDetails.slug}.png` }
      }
    }
  }
}

const alfredItems = (chars) => {
  const items = []
  for (const char of chars) {
    const item = alfredItem(emojiInfo[char], char)
    if (item == null) {
      // If the host system being used to build the workflow has emoji
      // available that emojilib hasn't incorporated yet, then we will hit
      // this path. For example, as of 2025-02-14 Unicode 16.0 defines an
      // emoji "face with bags under eyes" (0x01fae9) that is not present
      // in the emojilib data. If we add `null` to the search results list,
      // Alfred will not understand what to do with that result and will not
      // display any search results for the set that includes the `null` value.
      // Therefore, we have to omit it.
      /*
      const hex = [...char].map(c => c.codePointAt(0).toString(16)).join('')
      console.log(`${char} (${hex}) is missing`)
      */
      continue
    }
    items.push(item)
  }
  return { items }
}

const all = () => alfredItems(orderedEmoji)

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

module.exports = function search (query, skinTone, pasteByDefault = false) {
  if (pasteByDefault) resetWordsForPasteByDefault()

  setSkinToneModifier(skinTone)

  if (!query) return all()

  const terms = parse(query)

  return alfredItems(matches(terms))
}

module.exports.internals = {
  alfredItem
}
