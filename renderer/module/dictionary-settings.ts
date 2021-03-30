//

import {
  PlainRevisions,
  Revisions
} from "./revision";


export class DictionarySettings implements PlainDictionarySettings {

  public version: string;
  public alphabetRule: string;
  public revisions: Revisions;

  public constructor(version: string, alphabetRule: string, revisions: Revisions) {
    this.version = version;
    this.alphabetRule = alphabetRule;
    this.revisions = revisions;
  }

  public static fromPlain(plain: PlainDictionarySettings): DictionarySettings {
    let version = plain.version;
    let alphabetRule = plain.alphabetRule;
    let revisions = Revisions.fromPlain(plain.revisions);
    let settings = new DictionarySettings(version, alphabetRule, revisions);
    return settings;
  }

  public static fromString(string: string): DictionarySettings {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let version;
    let alphabetRule;
    let revisions;
    let before = true;
    let currentMode = "";
    let currentString = "";
    let setProperty = function (mode: string, string: string) {
      if (mode === "VERSION") {
        let match = string.match(/^\-\s*(.*)$/m);
        if (match) {
          version = match[1];
        }
      } else if (mode === "ALPHABET") {
        let match = string.match(/^\-\s*(.*)$/m);
        if (match) {
          alphabetRule = match[1];
        }
      } else if (mode === "REVISION") {
        revisions = Revisions.fromString(string);
      }
    };
    for (let line of lines) {
      let headerMatch = line.match(/^!(\w+)/);
      if (headerMatch) {
        if (!before) {
          setProperty(currentMode, currentString);
        }
        before = false;
        currentMode = headerMatch[1];
        currentString = "";
      } else {
        currentString += line + "\n";
      }
    }
    if (!before) {
      setProperty(currentMode, currentString);
    }
    if (version !== undefined && alphabetRule !== undefined && revisions !== undefined) {
      let settings = new DictionarySettings(version, alphabetRule, revisions);
      return settings;
    } else {
      throw new Error("parse failed");
    }
  }

  public toString(): string {
    let string = "";
    string += "!VERSION\n";
    string += `- ${this.version}\n`;
    string += "\n";
    string += "!ALPHABET\n";
    string += `- ${this.alphabetRule}\n`;
    string += "\n";
    string += "!REVISION\n";
    string += this.revisions.toString();
    return string;
  }

  public static createEmpty(): DictionarySettings {
    let version = "";
    let alphabetRule = "";
    let revisions = new Revisions();
    let settings = new DictionarySettings(version, alphabetRule, revisions);
    return settings;
  }

}


export interface PlainDictionarySettings {

  version: string;
  alphabetRule: string;
  revisions: PlainRevisions;

}