const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: './dist',
        },
        // host: 'local-ip',
        allowedHosts: 'all',
        compress: true,
        hot: 'only',
        // open: true,
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    },
    plugins: [
        new ESLintPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                        },
                    },
                ],
            },
        ],
    },
})
