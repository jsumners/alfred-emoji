'use strict'

// Based on https://stackoverflow.com/a/43808972/7979

const fs = require('fs')
const fontkit = require('fontkit')
const emojilib = require('emojilib')

const font = fontkit.openSync('/System/Library/Fonts/Apple Color Emoji.ttc').fonts[0]

emojilib.ordered.forEach((name) => {
  try {
    const emoji = font.layout(emojilib.lib[name].char)
    const glyph = emoji.glyphs[0].getImageForSize(64)
    fs.writeFileSync(`${process.env['PWD']}/${name}.png`, glyph.data)
  } catch (e) {
    console.error('Could not generate icon for "%s": %s', name, e.message)
  }
})
