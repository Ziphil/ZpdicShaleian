// @ts-nocheck

import electronReload from "electron-reload-webpack-plugin";
import * as path from "path";
import merge from "webpack-merge";
import common from "./webpack-common";


let electronReloadPlugin = electronReload({
  path: path.join(__dirname, "dist", "index.js"),
  stopOnClose: true,
  logLevel: 0
});

let main = merge(common[0], {
  mode: "development",
  devtool: "source-map",
  plugins: [
    electronReloadPlugin()
  ]
});

let renderer = merge(common[1], {
  mode: "development",
  devtool: "source-map",
  plugins: [
    electronReloadPlugin()
  ]
});

export default [main, renderer];