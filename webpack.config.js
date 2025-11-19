const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: 'development', // Change to 'production' for minified code
    entry: './src/js/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // Clean the dist folder before each build
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            ['@babel/preset-react', { runtime: 'automatic' }]
                        ],
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
                test: /\.(png|svg|jpg|jpeg|gif|obj|mtl|stl|wav|mp3)$/i,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
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
        new Dotenv(),
    ],
};
