//

import fs from "fs";
import {
  WriteStream
} from "fs";
import {
  Dictionary
} from "../dictionary";
import {
  DictionarySettings
} from "../dictionary-settings";
import {
  ExampleInformation,
  InformationKindUtil,
  NormalInformation,
  PhraseInformation
} from "../information";
import {
  ParsedWord
} from "../parsed-word";
import {
  MarkupResolver,
  Parser
} from "../parser";
import {
  Word
} from "../word";
import {
  Saver
} from "./saver";


export class OldShaleianSaver extends Saver {

  private readonly stream: WriteStream;
  private readonly parser: Parser<string>;
  private size: number = 0;
  private count: number = 0;

  public constructor(dictionary: Dictionary, path: string | null) {
    super(dictionary, path);
    let resolver = OldShaleianSaver.createMarkupResolver();
    this.stream = fs.createWriteStream(this.path, {encoding: "utf-8"});
    this.parser = new Parser(resolver);
  }

  public start(): void {
    let promise = Promise.resolve().then(this.writeDictionary.bind(this));
    promise.then(() => {
      this.stream.end(() => {
        this.emit("end");
      });
    }).catch((error) => {
      this.emit("error", error);
    });
  }

  private writeDictionary(): void {
    let dictionary = this.dictionary;
    this.writeWords(dictionary.words);
    this.writeSettings(dictionary.settings);
  }

  private writeWords(words: Array<Word>): void {
    for (let word of words) {
      let parsedWord = this.parser.parse(word);
      this.writeWord(parsedWord);
    }
  }

  private writeWord(word: ParsedWord<string>): void {
    this.stream.write(`* ${word.uniqueName}\n`);
    this.stream.write(`+ ${word.date} 〈${word.parts.ja?.lexicalCategory}〉\n`);
    this.stream.write("\n");
    for (let section of word.parts.ja?.sections ?? []) {
      for (let equivalent of section.equivalents) {
        this.stream.write("=");
        if (equivalent.hidden) {
          this.stream.write(": ");
        }
        if (equivalent.category !== null) {
          this.stream.write(`〈${equivalent.category}〉 `);
        }
        if (equivalent.frame !== null) {
          this.stream.write(`(${equivalent.frame}) `);
        }
        this.stream.write(equivalent.names.join(", "));
        this.stream.write("\n");
      }
      for (let information of section.informations) {
        let tag = InformationKindUtil.getTag(information.kind);
        this.stream.write(tag);
        if (information.kind === "history") {
          this.stream.write("~ ");
        } else {
          this.stream.write("> ");
        }
        if (information instanceof PhraseInformation) {
          this.stream.write(information.expression);
          this.stream.write(" … ");
          this.stream.write(information.equivalentNames.join(", "));
          this.stream.write("。");
          this.stream.write(information.text ?? "");
        } else if (information instanceof ExampleInformation) {
          this.stream.write(information.sentence);
          this.stream.write(" → ");
          this.stream.write(information.translation);
        } else if (information instanceof NormalInformation) {
          if (information.kind === "history" && information.date !== null) {
            this.stream.write(`${information.date}: `);
          }
          this.stream.write(information.text);
        }
        this.stream.write("\n");
      }
      for (let relation of section.relations) {
        this.stream.write("-");
        this.stream.write(`〈${relation.title}〉 `);
        this.stream.write(relation.entries.map((entry) => entry.name + ((entry.refer) ? "*" : "")).join(", "));
        this.stream.write("\n");
      }
      this.stream.write("\n");
    }
    this.count ++;
    this.emitProgress();
  }

  private writeSettings(settings: DictionarySettings): void {
    this.stream.write("* META-ALPHABET-ORDER\n\n");
    this.stream.write(`- ${settings.alphabetRule}\n`);
    this.stream.write("\n");
    this.stream.write("* META-VERSION\n\n");
    this.stream.write(`- ${settings.version}\n`);
    this.stream.write("\n");
    this.stream.write("* META-CHANGE\n\n");
    for (let revision of settings.revisions) {
      this.stream.write("- ");
      this.stream.write(`${revision.date ?? "?"}: `);
      this.stream.write(`${revision.beforeName} → ${revision.afterName}`);
      this.stream.write("\n");
    }
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

  private static createMarkupResolver(): MarkupResolver<string, string> {
    let resolveLink = function (name: string, children: Array<string>): string {
      return children.join("");
    };
    let resolveBracket = function (children: Array<string>): string {
      return "[" + children.join("") + "]";
    };
    let resolveBrace = function (children: Array<string>): string {
      return "{" + children.join("") + "}";
    };
    let resolveSlash = function (string: string): string {
      return "/" + string + "/";
    };
    let resolveEscape = function (char: string): string {
      char = char.replaceAll("/", "&#x2F;");
      return char;
    };
    let join = function (nodes: Array<string>): string {
      return nodes.join("");
    };
    let resolver = new MarkupResolver({resolveLink, resolveBracket, resolveBrace, resolveSlash, resolveEscape, join});
    return resolver;
  }

}