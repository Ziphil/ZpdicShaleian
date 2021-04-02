//


export class ParseError extends Error {

  public type: string;

  public constructor(type: string, message: string = "") {
    super(message);
    this.name = new.target.name;
    this.type = type;
    Object.setPrototypeOf(this, new.target.prototype);
  }

}


export class ValidationError extends Error {

  public type: string;

  public constructor(type: string, message: string = "") {
    super(message);
    this.name = new.target.name;
    this.type = type;
    Object.setPrototypeOf(this, new.target.prototype);
  }

}