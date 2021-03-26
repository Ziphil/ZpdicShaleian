// @ts-nocheck

import HtmlWebpackPlugin from "html-webpack-plugin";
import * as path from "path";
import {
  DefinePlugin
} from "webpack";


let main = {
  target: "electron-main",
  entry: {
    index: "./main/index.ts",
    preload: "./main/preload.ts"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};

let renderer = {
  target: "electron-renderer",
  entry: ["./renderer/index.tsx"],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "./script/bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {url: false}
          },
          {
            loader: "sass-loader"
          }
        ]
      },
      {
        test: /\.css/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {url: false}
          }
        ]
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: {
          loader: "source-map-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".scss"]
  },
  plugins: [
    new DefinePlugin({
      "process.env": {}
    }),
    new HtmlWebpackPlugin({
      template: "./renderer/public/index.html",
      title: "Soxsot"
    })
  ]
};

export default [main, renderer];