const webpack = require("webpack");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
    entry: "./js/index.tsx",
    devtool: "inline-source-map",
    node: {
        fs: "empty",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: `bundle.js?version=${Math.round(Math.random() * 100).toFixed(2)}`
    },

    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx", ".css"]
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
            }
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
        // new webpack.HotModuleReplacementPlugin({}),
        // new webpack.EnvironmentPlugin(['NODE_ENV'])
    ]
};

module.exports = config;
