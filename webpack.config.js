const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development', // Change to 'production' for minified code
    entry: './src/js/scripts.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // Clean the dist folder before each build
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            // Add CSS loader support
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            // Add support for loading assets
            {
                test: /\.(png|svg|jpg|jpeg|gif|obj|mtl|stl)$/i,
                type: 'asset/resource',
            },
        ],
    },
    // Add source maps for better debugging
    devtool: 'source-map',
    // Add dev server for live reloading
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        open: true, // Open browser when server starts
    },
    plugins: [
        // Copy static assets from public to dist
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '' }
            ],
        }),
    ],
};