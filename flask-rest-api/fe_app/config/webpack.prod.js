console.log(" >> PROD environment loaded!");
const APP_CONFIGURATIONS = require('./app.prod.config');
console.log(' App configuration:', APP_CONFIGURATIONS);

const path         = require('path');
const webpack      = require('webpack');
const Merge        = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');

module.exports = Merge(CommonConfig, {
    output: {
        path: path.resolve(__dirname, '../dist')
    },
    plugins: [
        new webpack.DefinePlugin(APP_CONFIGURATIONS),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true
            },
            comments: false,
            sourceMap: false
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),

    ]
});