const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/emoji.js',
  target: 'web',
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/')
    }
  },
  output: {
    library: 'run',
    path: path.join(__dirname, 'output'),
    filename: 'emoji.js'
  }
}
