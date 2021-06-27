'use strict'

// Based on https://stackoverflow.com/a/43808972/7979

const fs = require('fs')
const fontkit = require('fontkit')
const emojiData = require('unicode-emoji-json')
const emojiComponents = require('unicode-emoji-json/data-emoji-components')
const orderedEmoji = require('unicode-emoji-json/data-ordered-emoji')

// compatability layer:
const modifiers = [
  emojiComponents.light_skin_tone,
  emojiComponents.medium_light_skin_tone,
  emojiComponents.medium_skin_tone,
  emojiComponents.medium_dark_skin_tone,
  emojiComponents.dark_skin_tone
]
const font = fontkit.openSync('/System/Library/Fonts/Apple Color Emoji.ttc').fonts[0]

const saveIcon = (emoji, name) => {
  const glyph = emoji.glyphs[0].getImageForSize(64)
  fs.writeFileSync(`${process.env['PWD']}/${name}.png`, glyph.data)
}

const addModifier = (char, modifier) => {
  if (!modifier || !emojiData[char].skin_tone_support) return char
  const zwj = new RegExp('‍', 'g')
  return char.match(zwj) ? char.replace(zwj, modifier + '‍') : char + modifier
}

orderedEmoji.forEach((char) => {
  const emoji = emojiData[char]
  try {
    saveIcon(font.layout(char), emoji.slug)

    if (emoji.skin_tone_support) {
      modifiers.forEach((modifier, index) => {
        const charMod = font.layout(addModifier(char, modifier))
        saveIcon(charMod, `${emoji.slug}_${index}`)
      })
    }
  } catch (e) {
    console.error('Could not generate icon for "%s": %s', emoji ? emoji.name : char, e.message)
  }
})
