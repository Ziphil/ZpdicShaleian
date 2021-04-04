// @ts-nocheck

import electronReload from "electron-reload-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import * as path from "path";
import {
  EnvironmentPlugin,
  DefinePlugin
} from "webpack";
import merge from "webpack-merge";


let electronReloadPlugin = electronReload({
  path: path.join(__dirname, "dist", "index.js"),
  stopOnClose: true,
  logLevel: 0
});

export let commonMain = {
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

export let commonRenderer = {
  target: "electron-renderer",
  entry: ["./renderer/index.tsx"],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "./script/bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: {
          loader: "source-map-loader"
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
        test: /\.yml$/,
        use: [
          {
            loader: "json-loader"
          },
          {
            loader: "yaml-flat-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".scss", ".css", ".yml"]
  },
  plugins: [
    new EnvironmentPlugin({
      "BUILD_DATE": new Date().toISOString()
    }),
    new DefinePlugin({
      "process.env": {},
      "global": "globalThis"
    }),
    new HtmlWebpackPlugin({
      template: "./renderer/public/index.html"
    })
  ]
};

let main = merge(commonMain, {
  mode: "development",
  devtool: "source-map",
  plugins: [
    electronReloadPlugin()
  ]
});

let renderer = merge(commonRenderer, {
  mode: "development",
  devtool: "source-map",
  plugins: [
    electronReloadPlugin()
  ]
});

export default [main, renderer];