const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

process.traceDeprecation = true;

const isDevelopment = process.env.NODE_ENV === 'development'

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'src');

module.exports = {
    devtool: 'eval-source-map',
    target: 'web',
    entry: [
        APP_DIR + '/index.jsx'
    ],
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /(\.jsx|\.js)$/,
            loader: 'babel-loader',
            include: APP_DIR,
            exclude: [
                path.resolve(__dirname, 'node_modules')
            ]
        }, {
            test: /\.module\.s(a|c)ss$/,
            loader: [
                isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        sourceMap: isDevelopment
                    }
                },
                {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: isDevelopment
                    }
                }
            ]
        }, {
            test: /\.(s(a|c)|c)ss$/,
            exclude: /\.module.(s(a|c)ss)$/,
            loader: [
                isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                'css-loader',
                {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: isDevelopment
                    }
                }
            ]
        }, {
            test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            use: 'url-loader?limit=10000',
        }, {
            test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
            use: 'file-loader',
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: isDevelopment ? '[name].css' : '[name].[hash].css',
            chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
        }),
        new HtmlWebpackPlugin({
            title: "TadHack 2020 Web App"
        })
    ],
    resolve: {
        extensions: ['.json', '.js', '.jsx', '.css', '.scss']
    }
};
