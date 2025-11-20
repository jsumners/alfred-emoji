#!/bin/bash
# Fix for macOS Tahoe 26.2 where osascript run() function output is completely suppressed
# See: https://github.com/jsumners/alfred-emoji/issues/124
#
# This wrapper loads emoji.js and executes its logic WITHOUT relying on run()'s output

QUERY="$1"

/usr/bin/osascript -l JavaScript - "$QUERY" 2>&1 <<'JXASCRIPT' | grep -v '^[0-9][0-9][0-9][0-9]-' | grep '{"items"' | head -1
ObjC.import('stdlib')
ObjC.import('Foundation')

// Get the query argument
const args = $.NSProcessInfo.processInfo.arguments
const query = ObjC.unwrap(args.objectAtIndex(args.count - 1))

// Get environment variables (for skin_tone and snippetapp settings)
function getenv(name) {
  try {
    const val = $.getenv(name)
    return val ? ObjC.unwrap(val) : null
  } catch (e) {
    return null
  }
}

// Read the emoji.js webpack bundle
const scriptDir = getenv('PWD') || '.'
const emojiJsPath = scriptDir + '/emoji.js'
let emojiContent = ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(
  emojiJsPath,
  $.NSUTF8StringEncoding,
  null
))

// Execute the webpack bundle to load all modules
eval(emojiContent)

// Call run() and capture its return value
const result = run([query])

// Output using console.log (which WORKS outside of run())
if (result) {
  console.log(result)
} else {
  console.log('{"items":[{"title":"Error","subtitle":"No result from run()","arg":""}]}')
}
JXASCRIPT
