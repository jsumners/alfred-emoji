'use strict'

const emojilib = require('emojilib')
const emojiNames = emojilib.ordered

const alfredItem = (emoji, name) => {
  return {
    title: name,
    subtitle: `Copy "${emoji}" (${name}) to clipboard`,
    arg: emoji,
    autocomplete: name,
    icon: { path: `./icons/${name}.png` },
    mods: {
      alt: {
        subtitle: `Copy ":${name}:" (${emoji}) to clipboard`,
        arg: `:${name}:`
      }
    }
  }
}

const alfredItems = (names) => {
  const items = []
  names.forEach((name) => {
    const emoji = emojilib.lib[name].char
    if (!emoji) return
    items.push(alfredItem(emoji, name))
  })
  return { items }
}

const all = () => alfredItems(emojiNames)

const matchingName = (searchTerm) => {
  return emojiNames.filter((name) => name.includes(searchTerm))
}

const matchingAlias = (searchTerm) => {
  return emojiNames.filter((name) => {
    return emojilib.lib[name].keywords.some((keyword) => keyword.includes(searchTerm))
  })
}

module.exports = function search (query) {
  if (!query) return all()

  const searchTerm = query.replace(/[:\s]/g, '') // :thumbs up: => thumbsup

  const names = matchingName(searchTerm)
        .concat(matchingAlias(searchTerm))

  return alfredItems(new Set(names))
}
