const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        app: ['core-js/fn/promise', './src/index.js', './style/main.scss']
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'app.js',
        publicPath: '/'
    },
    resolve: {
        alias: {
            Apps: path.resolve(__dirname, '../src/app'),
            Utilities: path.resolve(__dirname, '../src/core/utils/'),
            Services: path.resolve(__dirname, '../src/core/services/'),
            Features: path.resolve(__dirname, '../src/features/')
        },
        extensions: ['.js', '.jsx', '.json'],
        modules: [path.join(__dirname, 'src'), 'node_modules']
    },
    module: {
        rules: [
            // NOTE: activate jsHint soon, but configure it properly on .jshintrc file
            // {
            //     enforce: 'pre',
            //     test: /\.js$/,
            //     exclude: /node_modules/,
            //     loader: 'jshint-loader'
            // },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-1']
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallbackLoader: "style-loader",
                    use: ['css-loader?url=false', 'sass-loader']
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({ // define where to save the file
            filename: 'app.css',
            allChunks: true,
        })
    ]
};

//See: https://webpack.js.org/guides/production/