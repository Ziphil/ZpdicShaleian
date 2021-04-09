//

import {
  DictionarySettings
} from "../dictionary-settings";
import {
  Markers
} from "../marker";
import {
  Revision,
  Revisions
} from "../revision";
import {
  Word
} from "../word";


export class Serializer {

  public serializeWord(word: Word): string {
    let string = "";
    string += `* @${word.date} ${word.uniqueName}\n`;
    string += "\n";
    let first = true;
    for (let [language, content] of Object.entries(word.contents)) {
      if (content !== undefined && content.trim() !== "") {
        if (!first) {
          string += "\n";
        }
        string += `!${language.toUpperCase()}\n`;
        string += content.replaceAll(/\r\n|\r|\n/g, "\n").trim();
        string += "\n";
        first = false;
      }
    }
    return string;
  }

  public serializeDictionarySettings(settings: DictionarySettings): string {
    let string = "";
    string += "**\n";
    string += "\n";
    string += "!VERSION\n";
    string += `- ${settings.version}\n`;
    string += "\n";
    string += "!ALPHABET\n";
    string += `- ${settings.alphabetRule}\n`;
    string += "\n";
    string += "!REVISION\n";
    string += this.serializeRevisions(settings.revisions);
    return string;
  }

  public serializeRevisions(revisions: Revisions): string {
    let string = "";
    for (let revision of revisions) {
      string += this.serializeRevision(revision);
    }
    return string;
  }

  public serializeRevision(revision: Revision): string {
    let string = "";
    string += "- ";
    if (revision.date !== null) {
      string += `@${revision.date} `;
    }
    string += `{${revision.beforeName}} → {${revision.afterName}}\n`;
    return string;
  }

  public serializeMarkers(markers: Markers): string {
    let string = "";
    string += "**\n";
    string += "\n";
    string += "!MARKER\n";
    for (let [uniqueName, wordMarkers] of markers.entries()) {
      string += `- ${uniqueName}: ${wordMarkers.join(", ")}\n`;
    }
    return string;
  }

}