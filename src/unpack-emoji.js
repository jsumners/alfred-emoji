'use strict'

const packedEmoji = require('./emoji.pack')
const Buffer = require('buffer/').Buffer

module.exports = function unpackEmoji () {
  const dataArray = Buffer.from(packedEmoji, 'base64')

  const { decode, ExtensionCodec } = require('@msgpack/msgpack')
  const extensionCodec = new ExtensionCodec()
  const MAP_EXT_TYPE = 1
  extensionCodec.register({
    type: MAP_EXT_TYPE,
    decode: (data) => {
      const array = decode(data)
      return new Map(array)
    }
  })

  return decode(dataArray, { extensionCodec })
}
