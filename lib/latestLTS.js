const semver = require('semver')
let data = ''
process.stdin.on('data', (d) => { data += d })
process.stdin.on('end', () => {
  const ar = JSON.parse(data)
  console.log(ar.sort(semver.rcompare)[0])
})
