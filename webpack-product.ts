// @ts-nocheck

import {
  CleanWebpackPlugin
} from "clean-webpack-plugin";
import merge from "webpack-merge";
import common from "./webpack-common";


let main = merge(common[0], {
  mode: "production",
  plugins: [
    new CleanWebpackPlugin()
  ]
});

let renderer = merge(common[1], {
  mode: "production"
});

export default [main, renderer];