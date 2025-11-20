/* eslint-disable no-undef */
'use strict'

const search = require('./search')
const { getRandomSkinTone } = require('./utils')
const pasteByDefault = getenv('snippetapp')
const skinTone = getSkinTone()

function getenv (name) {
  if (typeof $ === 'undefined') return process.env[name]

  ObjC.import('stdlib')
  try {
    return $.getenv(name)
  } catch (e) {
    return null
  }
}

function getSkinTone () {
  const skinTone = getenv('skin_tone')

  if (skinTone === 'random') {
    return getRandomSkinTone()
  }

  return skinTone
}

// JXA: JavaScript for Automation Interface (`osascript -l JavaScript`)
// Note: In JXA, console.log writes to stderr instead of stdout
// IMPORTANT: In macOS Tahoe 26.2+, console.log in run() produces NO output
// The return value is used by emoji-tahoe-fix.sh wrapper: https://github.com/jsumners/alfred-emoji/issues/124
function run (argv) {
  const query = argv[0]
  const found = search(query, skinTone, pasteByDefault)
  console.log(JSON.stringify(found))  // Doesn't work in Tahoe 26.2+
  return JSON.stringify(found)         // Return for wrapper script to capture
}

module.exports = run

// Node.js Testing Interface
// IMPORTANT: keep this commented out unless manually testing
// run(process.argv.slice(2))
