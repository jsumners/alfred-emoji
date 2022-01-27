const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/emoji.js',
  target: 'web',
  plugins: [
    new NodePolyfillPlugin()
  ],
  resolve: {
    fallback: {
      'path': require.resolve('path-browserify')
    }
  },
  output: {
    library: 'run',
    path: path.join(__dirname, 'output'),
    filename: 'emoji.js'
  }
}
