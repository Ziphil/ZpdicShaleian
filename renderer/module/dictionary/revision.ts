//


export class Revisions extends Array<Revision> implements Array<PlainRevision> {

  public constructor(...args: any) {
    super(...args);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static fromPlain(plain: Array<PlainRevision>): Revisions {
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

}


export interface PlainRevision {

  date: number | null;
  beforeName: string;
  afterName: string;

}