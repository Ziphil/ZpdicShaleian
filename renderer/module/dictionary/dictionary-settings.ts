//

import {
  PlainRevision,
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
  revisions: Array<PlainRevision>;

}