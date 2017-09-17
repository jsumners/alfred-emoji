'use strict'

const search = require('./search')
const searchTerm = process.argv[2]

const found = search(searchTerm)
console.log('%j', found)
