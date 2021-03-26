//


export class Word {

  public name: string;
  public date: number;
  public content: string;

  public constructor(name: string, date: number, content: string) {
    this.name = name;
    this.date = date;
    this.content = content;
  }

  public static fromString(string: string): Word {
    let lines = string.split(/\r\n|\r|\n/);
    let match = lines[0]?.match(/^\*\s*(.+)\s*@(\d+)/)
    if (match) {
      let name = match[1];
      let date = parseInt(match[2], 10);
      let content = lines.slice(1).join("\n");
      let word = new Word(name, date, content);
      return word;
    } else {
      throw new Error("parse failed");
    }
  }

}