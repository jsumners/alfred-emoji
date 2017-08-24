'use strict'

const emojilib = require('emojilib')
const emojiNames = emojilib.ordered
const searchTerm = process.argv[2]

if (!searchTerm) {
  const results = []
  emojiNames.forEach((name) => {
    const emoji = emojilib.lib[name].char
    results.push({
      title: emoji,
      subtitle: `Copy "${emoji}" (${name}) to clipboard`,
      arg: emoji,
      icon: { path: `./icons/${name}.png` }
    })
  })
  console.log('%j', {items: results})
  process.exit()
}

// search for the term within the names
const _searchTerm = searchTerm.replace(/:/g, '') // :unamused: => unamused
const nameResults = emojiNames.filter((name) => name === _searchTerm || name.includes(_searchTerm))
if (nameResults.length > 0) {
  const results = []
  nameResults.forEach((name) => {
    const emoji = emojilib.lib[name].char
    results.push({
      title: name,
      subtitle: `Copy "${emoji}" (${name}) to clipboard`,
      arg: emoji,
      icon: { path: `./icons/${name}.png` }
    })
  })
  console.log('%j', {items: results})
  process.exit(0)
}

// search for the term within the aliases
const aliasResults = []
for (var i = 0; i < emojiNames; i += 1) {
  const obj = emojilib.lib[emojiNames[i]]
  obj._name = emojiNames[i]
  if (!obj.keywords.includes(_searchTerm)) continue
  aliasResults.push(obj)
  break
}
const results = []
aliasResults.forEach((obj) => {
  const emoji = obj.char
  results.push({
    title: obj._name,
    subtitle: `Copy "${emoji}" (${obj._name}) to clipboard`,
    arg: emoji,
    icon: { path: `./icons/${obj._name}.png` }
  })
})
console.log('%j', {items: results})
