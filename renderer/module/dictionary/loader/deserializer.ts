//

import {
  DictionarySettings
} from "../dictionary-settings";
import {
  ParseError
} from "../error";
import {
  Marker,
  MarkerUtil,
  Markers
} from "../marker";
import {
  Revision,
  Revisions
} from "../revision";
import {
  Contents,
  Word
} from "../word";


export class Deserializer {

  public deserializeWord(string: string): Word {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let match = lines[0]?.match(/^\*\s*@(\d+)\s*(.+)/);
    if (match) {
      let uniqueName = match[2];
      let date = parseInt(match[1], 10);
      let contents = {} as Contents;
      let before = true;
      let currentLanguage = "";
      let currentContent = "";
      for (let i = 1 ; i < lines.length ; i ++) {
        let line = lines[i];
        let languageMatch = line.match(/^!(\w{2})/);
        if (languageMatch) {
          if (!before) {
            contents[currentLanguage] = currentContent.trim();
          }
          before = false;
          currentLanguage = languageMatch[1].toLowerCase();
          currentContent = "";
        } else {
          currentContent += line + "\n";
        }
      }
      if (!before) {
        contents[currentLanguage] = currentContent.trim();
      }
      let word = new Word(uniqueName, date, contents);
      return word;
    } else {
      throw new ParseError("invalidWordLine", `invalid line: ${lines[0]}`);
    }
  }

  public deserializeDictionarySettings(string: string): DictionarySettings {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let match = lines[0]?.match(/^\*\*/);
    if (match) {
      let version;
      let alphabetRule;
      let revisions;
      let before = true;
      let currentMode = "";
      let currentString = "";
      let outerThis = this;
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
          revisions = outerThis.deserializeRevisions(string);
        }
      };
      for (let i = 1 ; i < lines.length ; i ++) {
        let line = lines[i];
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
        throw new ParseError("insufficientDictionarySettings", "there are not enough sections in the dictionary settings");
      }
    } else {
      throw new ParseError("noDictionarySettingsHeader", "no header");
    }
  }

  public deserializeRevisions(string: string): Revisions {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let revisions = new Revisions();
    for (let line of lines) {
      if (line.trim() !== "") {
        let revision = this.deserializeRevision(line.trim());
        revisions.push(revision);
      }
    }
    return revisions;
  }

  public deserializeRevision(string: string): Revision {
    let match = string.match(/^\-\s*(?:@(\d+)\s*)?\{(.*?)\}\s*→\s*\{(.*?)\}\s*$/);
    if (match) {
      let date = (match[1] !== undefined) ? parseInt(match[1], 10) : null;
      let beforeName = match[2];
      let afterName = match[3];
      let revision = new Revision(date, beforeName, afterName);
      return revision;
    } else {
      throw new ParseError("invalidRevisionLine", `invalid line: '${string}'`);
    }
  }

  public deserializeMarkers(string: string): Markers {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let match = lines[0]?.match(/^\*\*/);
    if (match) {
      let rawMarkers = new Map<string, Array<Marker>>();
      for (let i = 1 ; i < lines.length ; i ++) {
        let line = lines[i];
        if (line.trim() !== "" && line.trim() !== "!MARKER") {
          let [uniqueName, wordMarkers] = this.deserializeWordMarker(line.trim());
          if (wordMarkers.length > 0) {
            rawMarkers.set(uniqueName, wordMarkers);
          }
        }
      }
      let markers = new Markers(rawMarkers.entries());
      return markers;
    } else {
      throw new ParseError("noMarkersHeader", "no header");
    }
  }

  public deserializeWordMarker(string: string): [string, Array<Marker>] {
    let match = string.match(/^\-\s*(?:\{(.*?)\}|(.*?))\s*:\s*(.*?)\s*$/);
    if (match) {
      let uniqueName = match[1] ?? match[2];
      let wordMarkers = match[3].split(/\s*,\s*/).map((value) => {
        let wordMarker = MarkerUtil.cast(value);
        if (wordMarker !== undefined) {
          return wordMarker;
        } else {
          throw new ParseError("noSuchMarker", `no such marker with name '${value}'`);
        }
      });
      return [uniqueName, wordMarkers];
    } else {
      throw new ParseError("invalidMarkerLine", `invalid line: '${string}'`);
    }
  }

}