/* eslint-disable no-undef */
'use strict'

function getenv (name) {
  if (typeof $ === 'undefined') return process.env[name]

  ObjC.import('stdlib')
  try {
    return $.getenv(name)
  } catch (e) {
    return null
  }
}

function getRandomSkinTone () {
  return Math.round(Math.random() * 4)
}

function getSkinTone () {
  const skinTone = getenv('skin_tone')

  if (skinTone === 'random') {
    return getRandomSkinTone()
  }

  return skinTone
}

const search = require('./search')
const pasteByDefault = getenv('snippetapp')
const skinTone = getSkinTone()

// JXA: JavaScript for Automation Interface (`osascript -l JavaScript`)
// Note: In JXA, console.log writes to stderr instead of stdout
function run (argv) {
  const query = argv[0]
  const found = search(query, skinTone, pasteByDefault)
  console.log(JSON.stringify(found))
}

module.exports = run

// Node.js Testing Interface
// IMPORTANT: keep this commented out unless manually testing
// run(process.argv.slice(2))
