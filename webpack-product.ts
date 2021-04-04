// @ts-nocheck

import {
  CleanWebpackPlugin
} from "clean-webpack-plugin";
import merge from "webpack-merge";
import {
  commonMain,
  commonRenderer
} from "./webpack-develop";


let main = merge(commonMain, {
  mode: "production",
  plugins: [
    new CleanWebpackPlugin()
  ]
});

let renderer = merge(commonRenderer, {
  mode: "production"
});

export default [main, renderer];