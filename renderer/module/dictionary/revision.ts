//


export class Revisions extends Array<Revision> implements PlainRevisions {

  public constructor(...args: any) {
    super(...args);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static fromPlain(plain: PlainRevisions): Revisions {
    let rawRevisions = plain.map((plainRevision) => {
      let date = plainRevision.date;
      let beforeName = plainRevision.beforeName;
      let afterName = plainRevision.afterName;
      let revision = new Revision(date, beforeName, afterName);
      return revision;
    });
    let revisions = new Revisions(...rawRevisions);
    return revisions;
  }

  public toPlain(): PlainRevisions {
    return this;
  }

  public resolve(name: string): Array<string> {
    let outerThis = this;
    let resolveRec = function (currentName: string, beforeNames: Array<string>): Array<string> {
      let revisions = outerThis.filter((revision) => revision.beforeName === currentName);
      let resultNames = [];
      for (let revision of revisions) {
        if (beforeNames.includes(revision.afterName)) {
        } else {
          let result = resolveRec(revision.afterName, [...beforeNames, revision.afterName]);
          resultNames.push(revision.afterName, ...result);
        }
      }
      return resultNames;
    };
    let resultNames = resolveRec(name, [name]);
    return resultNames;
  }

}


export class Revision implements PlainRevision {

  public date: number | null;
  public beforeName: string;
  public afterName: string;

  public constructor(date: number | null, beforeName: string, afterName: string) {
    this.date = date;
    this.beforeName = beforeName;
    this.afterName = afterName;
  }

  public static fromPlain(plain: PlainRevision): Revision {
    let date = plain.date;
    let beforeName = plain.beforeName;
    let afterName = plain.afterName;
    let revision = new Revision(date, beforeName, afterName);
    return revision;
  }

  public toPlain(): PlainRevision {
    return this;
  }

}


export interface PlainRevision {

  date: number | null;
  beforeName: string;
  afterName: string;

}


export interface PlainRevisions extends Array<PlainRevision> {

}