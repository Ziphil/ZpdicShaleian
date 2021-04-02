//

import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple";


CodeMirror.defineSimpleMode("shcontent", {
  start: [
    {regex: /\+|=\??|\-|\w\??:/, sol: true, token: "operator"},
    {regex: /(<)(.+?)(>)/, token: "tag"},
    {regex: /@\d+/, token: "date"},
    {regex: /\{/, token: "markup", next: "brace"},
    {regex: /\[/, token: "markup", next: "bracket"},
    {regex: /(\/)(.+?)(\/)/, token: ["markup", null as any, "markup"]},
    {regex: /`./, token: "escape"}
  ],
  brace: [
    {regex: /(\/)(.+?)(\/)/, token: ["markup", null as any, "markup"]},
    {regex: /`./, token: "escape"},
    {regex: /\}/, token: "markup", next: "start"}
  ],
  bracket: [
    {regex: /(\/)(.+?)(\/)/, token: ["markup", null as any, "markup"]},
    {regex: /`./, token: "escape"},
    {regex: /\]/, token: "markup", next: "start"}
  ]
});