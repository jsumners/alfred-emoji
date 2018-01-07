'use strict'

const search = require('./search')
const query = process.argv[2]

const found = search(query)
console.log('%j', found)
