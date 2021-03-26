//


export class Word {

  public name: string;
  public date: number;
  public contents: Map<string, string>;

  public constructor(name: string, date: number, contents: Map<string, string>) {
    this.name = name;
    this.date = date;
    this.contents = contents;
  }

  public static fromString(string: string): Word {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let match = lines[0]?.match(/^\*\s*(.+)\s*@(\d+)/)
    if (match) {
      let name = match[1];
      let date = parseInt(match[2], 10);
      let contents = new Map<string, string>();
      let currentLanguage = "";
      let currentContent = "";
      for (let i = 1 ; i < lines.length ; i ++) {
        let line = lines[i];
        let languageMatch = line.match(/^!(\w{2})/);
        if (languageMatch) {
          if (currentLanguage !== "" && currentContent !== "") {
            contents.set(currentLanguage, currentContent.trim());
          }
          currentLanguage = languageMatch[1].toLowerCase();
          currentContent = "";
        } else {
          currentContent += line + "\n";
        }
      }
      if (currentContent !== "") {
        contents.set(currentLanguage, currentContent.trim());
      }
      let word = new Word(name, date, contents);
      return word;
    } else {
      throw new Error("parse failed");
    }
  }

}