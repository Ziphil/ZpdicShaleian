//

import {
  ParseError
} from "./error";


export class Markers extends Map<string, Array<Marker>> implements Map<string, Array<Marker>> {

  public constructor(...args: any) {
    super(...args);
    Object.setPrototypeOf(this, new.target.prototype);
    this.normalize();
  }

  public static fromPlain(plain: Map<string, Array<Marker>>): Markers {
    let markers = new Markers(plain.entries());
    return markers;
  }

  public static fromString(string: string): Markers {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let rawMarkers = new Map<string, Array<Marker>>();
    for (let line of lines) {
      if (line.trim() !== "" && line.trim() !== "!MARKER") {
        let match = line.match(/^\-\s*(?:\{(.*?)\}|(.*?))\s*:\s*(.*?)\s*$/);
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
          if (wordMarkers.length > 0) {
            rawMarkers.set(uniqueName, wordMarkers);
          }
        } else {
          throw new ParseError("invalidMarkerLine", `invalid line: '${line}'`);
        }
      }
    }
    let markers = new Markers(rawMarkers.entries());
    return markers;
  }

  public toString(): string {
    let string = "";
    string += "!MARKER\n";
    for (let [uniqueName, wordMarkers] of this.entries()) {
      string += `- ${uniqueName}: ${wordMarkers.join(", ")}\n`;
    }
    return string;
  }

  public static createEmpty(): Markers {
    let markers = new Markers();
    return markers;
  }

  private normalize(): void {
    for (let [, wordMarkers] of this.entries()) {
      MarkerUtil.sort(wordMarkers);
    }
  }

  public get(uniqueName: string): Array<Marker> {
    let markers = super.get(uniqueName) ?? [];
    return markers;
  }

  public toggle(uniqueName: string, marker: Marker): void {
    let wordMarkers = [...this.get(uniqueName)];
    let index = wordMarkers.findIndex((existingMarker) => existingMarker === marker);
    if (index >= 0) {
      wordMarkers.splice(index, 1);
    } else {
      wordMarkers.push(marker);
    }
    if (wordMarkers.length > 0) {
      MarkerUtil.sort(wordMarkers);
      super.set(uniqueName, wordMarkers);
    } else {
      super.delete(uniqueName);
    }
  }

}


export class MarkerUtil {

  public static cast(value: string | number | null | undefined): Marker | undefined {
    if (typeof value === "string") {
      let anyValue = value as any;
      let index = MARKERS.indexOf(anyValue);
      if (index >= 0) {
        return MARKERS[index];
      } else {
        return undefined;
      }
    } else if (typeof value === "number") {
      if (value >= 0 && value < MARKERS.length) {
        return MARKERS[value];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  public static sort(markers: Array<Marker>): Array<Marker> {
    return markers.sort((firstMarker, secondMarker) => this.getIndex(firstMarker) - this.getIndex(secondMarker));
  }

  public static getIndex(marker: Marker): number {
    return MARKERS.indexOf(marker);
  }

}


export const MARKERS = ["circle", "square", "up", "diamond", "down", "cross", "heart", "pentagon", "hexagon", "trapezoid"] as const;
export type Marker = (typeof MARKERS)[number];