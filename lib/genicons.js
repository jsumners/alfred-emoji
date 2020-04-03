'use strict'

// Based on https://stackoverflow.com/a/43808972/7979

const fs = require('fs')
const fontkit = require('fontkit')
const emojilib = require('emojilib')

const modifiers = emojilib.fitzpatrick_scale_modifiers
const font = fontkit.openSync('/System/Library/Fonts/Apple Color Emoji.ttc').fonts[0]

const saveIcon = (emoji, name) => {
  const glyph = emoji.glyphs[0].getImageForSize(64)
  fs.writeFileSync(`${process.env['PWD']}/${name}.png`, glyph.data)
}

const addModifier = (emoji, modifier) => {
  if (!modifier || !emoji.fitzpatrick_scale) return emoji.char
  const zwj = new RegExp('‍', 'g')
  return emoji.char.match(zwj) ? emoji.char.replace(zwj, modifier + '‍') : emoji.char + modifier
}

emojilib.ordered.forEach((name) => {
  try {
    const emoji = font.layout(emojilib.lib[name].char)
    saveIcon(emoji, name)

    if (emojilib.lib[name].fitzpatrick_scale) {
      modifiers.forEach((modifier, index) => {
        const emoji = font.layout(addModifier(emojilib.lib[name], modifier))
        saveIcon(emoji, `${name}_${index}`)
      })
    }
  } catch (e) {
    console.error('Could not generate icon for "%s": %s', name, e.message)
  }
})
