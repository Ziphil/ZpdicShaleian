//

import CodeMirror from "codemirror";
import "codemirror/addon/mode/simple";


let contentBase = [
  {regex: /\+|=\??|\-|\w\??:/, sol: true, token: "operator"},
  {regex: /(<)(.*?)(>)/, token: "tag"},
  {regex: /@\d+/, token: "date"},
  {regex: /\{/, token: "markup", push: "brace"},
  {regex: /\[/, token: "markup", push: "bracket"},
  {regex: /\//, token: "markup", push: "slash"},
  {regex: /`./, token: "escape"}
];
let revisionBase = [
  {regex: /\-/, sol: true, token: "operator"},
  {regex: /@\d+/, token: "date"},
  {regex: /→/, token: "operator"},
  {regex: /\{/, token: "markup", push: "brace"}
];

CodeMirror.defineSimpleMode("shcontent", {
  start: [
    {regex: /^=\??/, sol: true, token: "operator", next: "equivalent"},
    {regex: /^P\??:/, sol: true, token: "operator", next: "phrase"},
    {regex: /^S\??:/, sol: true, token: "operator", next: "phrase"},
    ...contentBase
  ],
  equivalent: [
    {regex: /(?=\+|=\??|\-|\w\??:)/, next: "start"},
    {regex: /\(/, token: "frame", push: "frame"},
    ...contentBase
  ],
  phrase: [
    {regex: /(?=\+|=\??|\-|\w\??:)/, next: "start"},
    {regex: /→/, token: "operator"},
    {regex: /\|/, token: "operator"},
    ...contentBase
  ],
  sentence: [
    {regex: /(?=\+|=\??|\-|\w\??:)/, next: "start"},
    {regex: /→/, token: "operator"},
    ...contentBase
  ],
  brace: [
    {regex: /\}/, token: "markup", pop: true},
    ...contentBase
  ],
  bracket: [
    {regex: /\]/, token: "markup", pop: true},
    ...contentBase
  ],
  slash: [
    {regex: /\//, token: "markup", pop: true},
    ...contentBase
  ],
  frame: [
    {regex: /\)/, token: "frame", pop: true},
    {regex: /(?=\+|=\??|\-|\w\??:)/, pop: true},
    {regex: /\{/, token: "frame-markup", push: "frameBrace"},
    {regex: /\[/, token: "frame-markup", push: "frameBracket"},
    {regex: /\//, token: "frame-markup", push: "frameSlash"},
    {regex: /[^\)\{\[\/]*/, token: "frame"},
    ...contentBase
  ],
  frameBrace: [
    {regex: /\}/, token: "frame-markup", pop: true},
    {regex: /[^\}]*/, token: "frame"},
    ...contentBase
  ],
  frameBracket: [
    {regex: /\]/, token: "frame-markup", pop: true},
    {regex: /[^\]]*/, token: "frame"},
    ...contentBase
  ],
  frameSlash: [
    {regex: /\//, token: "frame-markup", pop: true},
    {regex: /[^\/]*/, token: "frame"},
    ...contentBase
  ]
});

CodeMirror.defineSimpleMode("shrevision", {
  start: [
    ...revisionBase
  ],
  brace: [
    {regex: /\}/, token: "markup", pop: true},
    ...revisionBase
  ]
});