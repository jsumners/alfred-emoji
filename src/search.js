'use strict'

const emojilib = require('emojilib')
const emojiNames = emojilib.ordered

module.exports = function search (searchTerm) {
  if (!searchTerm) {
    const results = []
    emojiNames.forEach((name) => {
      const emoji = emojilib.lib[name].char
      if (!emoji) return
      results.push({
        title: emoji,
        subtitle: `Copy "${emoji}" (${name}) to clipboard`,
        arg: emoji,
        icon: { path: `./icons/${name}.png` }
      })
    })
    return {items: results}
  }

  let ret = {items: []}

  // search for the term within the names
  const _searchTerm = searchTerm
    .replace(/:/g, '') // :unamused: => unamused
    .replace(/\s/g, '') // 'thumbs up' => 'thumbsup'
  const nameResults = emojiNames.filter((name) => name === _searchTerm || name.includes(_searchTerm))
  if (nameResults.length > 0) {
    const results = []
    nameResults.forEach((name) => {
      const emoji = emojilib.lib[name].char
      if (!emoji) return
      results.push({
        title: name,
        subtitle: `Copy "${emoji}" (${name}) to clipboard`,
        arg: emoji,
        icon: { path: `./icons/${name}.png` }
      })
    })
    ret.items = ret.items.concat(results)
  }

  // search for the term within the aliases
  const aliasResults = []
  for (var i = 0; i < emojiNames.length; i += 1) {
    const obj = emojilib.lib[emojiNames[i]]
    obj._name = emojiNames[i]
    const filtered = obj.keywords.filter((keyword) => keyword.includes(_searchTerm))
    if (filtered.length > 0) aliasResults.push(obj)
  }
  const results = []
  aliasResults.forEach((obj) => {
    const emoji = obj.char
    if (!emoji) return
    results.push({
      title: obj._name,
      subtitle: `Copy "${emoji}" (${obj._name}) to clipboard`,
      arg: emoji,
      icon: { path: `./icons/${obj._name}.png` }
    })
  })
  ret.items = ret.items.concat(results)

  const uniq = new Set(ret.items)
  ret.items = Array.from(uniq)
  return ret
}
