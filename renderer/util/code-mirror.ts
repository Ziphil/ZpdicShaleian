//

import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple";


CodeMirror.defineSimpleMode("shcontent", {
  start: [
    {regex: /\+|=\??|\-|\w\??:/, sol: true, token: "operator"},
    {regex: /(<)(.+?)(>)/, token: "tag"},
    {regex: /@\d+/, token: "date"},
    {regex: /(\{)(.+?)(\}\*?)/, token: ["markup", null as any, "markup"]},
    {regex: /(\[)(.+?)(\])/, token: ["markup", null as any, "markup"]},
    {regex: /(\/)(.+?)(\/)/, token: ["markup", null as any, "markup"]},
    {regex: /`./, token: "escape"}
  ]
});