'use strict'

const emojilib = require('emojilib')
const emojiNames = emojilib.ordered

const formattedResults = (names) => {
  const results = []
  names.forEach((name) => {
    const emoji = emojilib.lib[name].char
    if (!emoji) return
    results.push({
      title: name,
      subtitle: `Copy "${emoji}" (${name}) to clipboard`,
      arg: emoji,
      icon: { path: `./icons/${name}.png` }
    })
  })
  return results
}

const all = () => formattedResults(emojiNames)

// search within the names
const matchingName = (searchTerm) => {
  const names = emojiNames.filter((name) => name.includes(searchTerm))
  return formattedResults(names)
}

// search within the aliases
const matchingAlias = (searchTerm) => {
  const names = []
  emojiNames.forEach((name) => {
    if (emojilib.lib[name].keywords.some((keyword) => keyword.includes(searchTerm))) {
      names.push(name)
    }
  })
  return formattedResults(names)
}

module.exports = function search (searchTerm) {
  if (!searchTerm) return { items: all() }

  const _searchTerm = searchTerm.replace(/[:\s]/g, '') // :thumbs up: => thumbsup

  const ret = { items: [] }

  ret.items = ret.items.concat(matchingName(_searchTerm))
  ret.items = ret.items.concat(matchingAlias(_searchTerm))

  const uniq = new Set(ret.items)
  ret.items = Array.from(uniq)
  return ret
}
