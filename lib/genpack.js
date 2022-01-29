'use strict'

const fs = require('fs')
const path = require('path')
const { encode, decode, ExtensionCodec } = require('@msgpack/msgpack')
const emojiKeywords = require('emojilib')
const emojiData = require('unicode-emoji-json')

const keywordsMap = new Map()
const emmojiInfo = new Map()

const emojiSymbols = Object.keys(emojiKeywords)
for (const emojiSymbol of emojiSymbols) {
  emojiKeywords[emojiSymbol].forEach(keyword => {
    if (keywordsMap.has(keyword) === false) {
      keywordsMap.set(keyword, [])
    }
    keywordsMap.get(keyword).push(emojiSymbol)
  })
  emmojiInfo.set(emojiSymbol, {
    ...emojiData[emojiSymbol],
    keywords: emojiKeywords[emojiSymbol]
  })
}

const extensionCodec = new ExtensionCodec()
const MAP_EXT_TYPE = 1 // Any in 0-127
extensionCodec.register({
  type: MAP_EXT_TYPE,
  encode: (object) => {
    if (object instanceof Map) {
      return encode([...object])
    } else {
      return null
    }
  },
  decode: (data) => {
    const array = decode(data)
    return new Map(array)
  }
})

const packedEmoji = {
  keywords: keywordsMap,
  searchTerms: Array.from(keywordsMap.keys()),
  emoji: emmojiInfo
}
const encodedData = encode(packedEmoji, { extensionCodec })

const packBuffer = Buffer.from(encodedData.buffer, encodedData.byteOffset, encodedData.byteLength)
const emojiPack = `module.exports = '${packBuffer.toString('base64')}';`

fs.writeFile(
  path.join(__dirname, '..', 'src', 'emoji.pack.js'),
  Buffer.from(emojiPack),
  (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  }
)
