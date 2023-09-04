//


export class HairianUtil {

  public static getHairia(date?: Date | number | string | null): number {
    if (date === null || date === undefined) {
      date = new Date();
    } else if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const genesis = new Date(2012, 0, 22, 6);
    const hairia = Math.floor((date.getTime() - genesis.getTime()) / (1000 * 60 * 60 * 24));
    return hairia;
  }

}