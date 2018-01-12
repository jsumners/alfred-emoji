'use strict'

const emojilib = require('emojilib')
const emojiNames = emojilib.ordered

const alfredItem = (emoji, name) => {
  return {
    uid: name,
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

const matchingName = (terms) => {
  return emojiNames.filter((name) => {
    return terms.every((term) => name.includes(term))
  })
}

const matchingAlias = (terms) => {
  return emojiNames.filter((name) => {
    return terms.every((term) => {
      return emojilib.lib[name].keywords.some((keyword) => keyword.includes(term))
    })
  })
}

// :thumbs up: => ['thumbs', 'up']
const parse = query => query.replace(/[:]/g, '').split(/\s+/)

module.exports = function search (query) {
  if (!query) return all()

  const terms = parse(query)

  const names = matchingName(terms)
        .concat(matchingAlias(terms))

  return alfredItems(new Set(names))
}
