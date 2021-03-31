//


export class ArrayUtil {

  public static shuffle<T>(words: Array<T>): Array<T> {
    for (let i = words.length - 1 ; i > 0 ; i --) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = words[i];
      words[i] = words[j];
      words[j] = temp;
    }
    return words;
  }

}