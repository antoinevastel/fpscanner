// webpack.config.js
const webpack = require('webpack');
const path = require('path');

const config = {
    context: path.resolve(__dirname, 'src/collect'),
    entry: './fpCollect.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        library: 'fpCollect'
    },
    module: {
        rules: [{
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['es2015', { modules: false }]
                    ]
                }
            }]
        }]
    }
};

module.exports = config;