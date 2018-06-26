const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const glob = require('glob')

function getEntry (ext) {
  const rootPath = './src/'
  const globArray = glob.sync(`${ext}/**/*.${ext}`, {cwd: rootPath})
  const entryObject = {}
  const htmlPlugin = []
  const re = /(?!.*\/).+(?=.html|.js)/
  globArray.forEach(file => {
    const fileName = file.match(re)
    switch (ext) {
      case 'js':
        entryObject[fileName[0]] = ['babel-polyfill', `${rootPath}${fileName.input}`]
        break
      case 'html':
        htmlPlugin.push(
          new HtmlWebpackPlugin({
            chunks: [fileName[0], 'vendors'],
            hash: true,
            filename: `../views/${fileName[0]}.${ext}`,
            template: `${rootPath}${fileName.input}`
          })
        )
        break
      default:
        break
    }
  })
  if (ext === 'js') {
    return entryObject
  } else if (ext === 'html') {
    return htmlPlugin
  }
}

module.exports = {
  entry: getEntry('js'),
  output: {
    path: path.resolve(__dirname, 'publics'),
    filename: 'js/[name].js',
    publicPath: '/publics/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'stage-0']
          }
        }
      },
      {
        test: /\.(png|jpg|gif|mov|mp4)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'image/[name].[ext]',
              publicPath: '/publics/'
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              attrs: ['img:src', 'source:src']
            }
          }
        ]
      }
    ]
  },
  plugins: [
    ...getEntry('html'),
    new ExtractTextPlugin({
      filename: 'css/[name].css'
    }),
    new CleanWebpackPlugin([
      path.resolve(__dirname, 'views'),
      path.resolve(__dirname, 'publics/js/'),
      path.resolve(__dirname, 'publics/css/'),
      path.resolve(__dirname, 'publics/image/')
    ])
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}
