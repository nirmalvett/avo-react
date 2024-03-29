const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const env = process.env.NODE_ENV;

const config = {
    entry: "./js/index.tsx",
    devtool: env && env === 'production' ? "" : 'inline-source-map',
    node: {
        fs: "empty",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: `bundle.js?version=${Math.random().toFixed(10)}`
    },

    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx", ".css", ".scss"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.(png|svg|jpg|gif|ico)$/,
                use: "file-loader?name=[name].[ext]"
            },
            {
                test: /\.yaml$/,
                use: "js-yaml-loader"
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Translates CSS into CommonJS\
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./index.html",
            filename: "./index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "app.css"
        }),
        new webpack.HotModuleReplacementPlugin({}),
        new webpack.EnvironmentPlugin(['NODE_ENV']),
    ]
};

module.exports = config;
