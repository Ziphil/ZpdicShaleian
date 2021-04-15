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

  public static createEmpty(): DictionarySettings {
    let version = "";
    let alphabetRule = "";
    let revisions = new Revisions();
    let settings = new DictionarySettings(version, alphabetRule, revisions);
    return settings;
  }

  public static fromPlain(plain: PlainDictionarySettings): DictionarySettings {
    let version = plain.version;
    let alphabetRule = plain.alphabetRule;
    let revisions = Revisions.fromPlain(plain.revisions);
    let settings = new DictionarySettings(version, alphabetRule, revisions);
    return settings;
  }

  public toPlain(): PlainDictionarySettings {
    let version = this.version;
    let alphabetRule = this.alphabetRule;
    let revisions = this.revisions.toPlain();
    return {version, alphabetRule, revisions};
  }

}


export interface PlainDictionarySettings {

  version: string;
  alphabetRule: string;
  revisions: PlainRevisions;

}