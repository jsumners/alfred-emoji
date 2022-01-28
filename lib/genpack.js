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
const encodedData = encode(
  {
    keywords: keywordsMap,
    emoji: emmojiInfo
  },
  { extensionCodec }
)

const packBuffer = Buffer.from(encodedData.buffer, encodedData.byteOffset, encodedData.byteLength)
const emojiPack = `
module.exports = function getPack() {
  const dataStr = '${packBuffer.toString('base64')}';
  let dataArray;

  const inJXA = (function() {
    try {
      eval('ObjC')
      return true
    } catch {
      return false
    }
  }())

  if (inJXA === true) {
    const encodedData = $.NSData.alloc.initWithBase64EncodedStringOptions(dataStr, 0)
    // const encodedStr = $.NSString.alloc.initWithDataEncoding(encodedData, $.NSUTF8StringEncoding)
    // console.log(ObjC.unwrap(encodedStr)
    dataArray = ObjC.unwrap(encodedData)
  } else {
    dataArray = Buffer.from(dataStr, 'base64');
  }

  const { decode, ExtensionCodec } = require('@msgpack/msgpack');
  const extensionCodec = new ExtensionCodec();
  const MAP_EXT_TYPE = 1;
  extensionCodec.register({
    type: MAP_EXT_TYPE,
    decode: (data) => {
      const array = decode(data);
      return new Map(array);
    }
  });

  return decode(dataArray, { extensionCodec });
}
`

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
