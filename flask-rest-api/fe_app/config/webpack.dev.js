console.log(" >> DEV environment loaded!");
const APP_CONFIGURATIONS = require('./app.dev.config');
console.log(' App configuration:', APP_CONFIGURATIONS);

const path         = require('path');
const webpack      = require('webpack');
const Merge        = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');

module.exports = Merge(CommonConfig, {
    output: {
        path: path.resolve(__dirname, '../dev')
    },
    devServer: {
        port: 5000,
        host: 'localhost',
        noInfo: false,
        stats: 'minimal',
        publicPath: '/',
        historyApiFallback: true,
        contentBase: './'
    },
    watch: false,
    devtool: "source-map",
    plugins: [
        new webpack.DefinePlugin(APP_CONFIGURATIONS),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('dev')
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: true
        })
    ]
});