const path = require('path');

module.exports = {
    entry: './js/scripts.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,  // Exclude the node_modules directory
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],  // Use the preset-env for transpiling
                    },
                },
            },
        ],
    },
};
