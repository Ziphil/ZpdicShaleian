//


export const LEXICAL_CATEGORY_DATA = {
  verbal: {
    names: {ja: "動辞", en: "Verbal"},
    abbreviations: {ja: "動", en: "V"}
  },
  nominal: {
    names: {ja: "名辞", en: "Nominal"},
    abbreviations: {ja: "名", en: "N"}
  },
  adverbial: {
    names: {ja: "副辞", en: "Adverbial"},
    abbreviations: {ja: "副", en: "B"}
  },
  functional: {
    names: {ja: "機能辞", en: "Functional"},
    abbreviations: {ja: "機", en: "F"}
  },
  particle: {
    names: {ja: "助接辞", en: "Particle"},
    abbreviations: {ja: "助", en: "P"}
  },
  connective: {
    names: {ja: "連結辞", en: "Connective"},
    abbreviations: {ja: "連", en: "C"}
  },
  interjection: {
    names: {ja: "間投辞", en: "Interjection"},
    abbreviations: {ja: "間", en: "I"}
  }
} as const;
export const CATEGORY_DATA = {
  verb: {
    names: {ja: "動詞", en: "Verb"},
    abbreviations: {ja: "動", en: "V"}
  },
  noun: {
    names: {ja: "名詞", en: "Noun"},
    abbreviations: {ja: "名", en: "N"}
  },
  adjective: {
    names: {ja: "形容詞", en: "Adjective"},
    abbreviations: {ja: "形", en: "A"}
  },
  adverb: {
    names: {ja: "副詞", en: "Adverb"},
    abbreviations: {ja: "副", en: "B"}
  },
  preposition: {
    names: {ja: "助詞", en: "Preposition"},
    abbreviations: {ja: "助", en: "P"}
  },
  conjunction: {
    names: {ja: "接続詞", en: "Conjunction"},
    abbreviations: {ja: "接", en: "C"}
  },
  interjection: {
    names: {ja: "間投詞", en: "Interjection"},
    abbreviations: {ja: "間", en: "I"}
  }
} as const;
export const VERBAL_INFLECTION_CATEGORY_DATA = {
  verb: {
    ...CATEGORY_DATA.verb
  },
  adjective: {
    ...CATEGORY_DATA.adjective,
    prefix: "a"
  },
  adverb: {
    ...CATEGORY_DATA.adverb,
    prefix: "o"
  },
  nounAdverb: {
    names: {ja: "名詞修飾副詞", en: "Noun-modifying adverb"},
    prefix: "io"
  }
};
export const ADVERBIAL_INFLECTION_CATEGORY_DATA = {
  adverb: {
    ...CATEGORY_DATA.adverb,
    prefix: "e"
  }
};
export const PARTICLE_INFLECTION_TYPE_DATA = {
  nonverb: {
    names: {ja: "非動詞修飾", en: "Nonverb-modifying"},
    prefix: "i"
  }
};
export const TENSE_DATA = {
  present: {
    names: {ja: "現在時制", en: "Present"},
    suffix: "a"
  },
  past: {
    names: {ja: "過去時制", en: "Past"},
    suffix: "e"
  },
  future: {
    names: {ja: "未来時制", en: "Future"},
    suffix: "i"
  },
  diachronic: {
    names: {ja: "通時時制", en: "Diachronic"},
    suffix: "o"
  }
} as const;
export const ASPECT_DATA = {
  inceptive: {
    names: {ja: "開始相", en: "Inceptive"},
    suffix: {intransitive: "f", transitive: "v"}
  },
  progressive: {
    names: {ja: "経過相", en: "Progressive"},
    suffix: {intransitive: "c", transitive: "q"}
  },
  perfect: {
    names: {ja: "完了相", en: "Perfect"},
    suffix: {intransitive: "k", transitive: "g"}
  },
  continuous: {
    names: {ja: "継続相", en: "Continuous"},
    suffix: {intransitive: "t", transitive: "d"}
  },
  terminative: {
    names: {ja: "終了相", en: "Terminative"},
    suffix: {intransitive: "p", transitive: "b"}
  },
  indefinite: {
    names: {ja: "無相", en: "Indefinite"},
    suffix: {intransitive: "s", transitive: "z"}
  }
} as const;
export const TRANSITIVITY_DATA = {
  intransitive: {
    names: {ja: "自動", en: "Intransitive"}
  },
  transitive: {
    names: {ja: "他動", en: "Transitive"}
  }
} as const;
export const NEGATIVE_DATA = {
  names: {ja: "否定", en: "Negative"},
  prefix: "du"
};

export type LexicalCategory = keyof typeof LEXICAL_CATEGORY_DATA;
export type Category = keyof typeof CATEGORY_DATA;
export type VerbalInflectionCategory = keyof typeof VERBAL_INFLECTION_CATEGORY_DATA;
export type AdverbialInflectionCategory = keyof typeof ADVERBIAL_INFLECTION_CATEGORY_DATA;
export type ParticleInflectionType = keyof typeof PARTICLE_INFLECTION_TYPE_DATA;
export type Tense = keyof typeof TENSE_DATA;
export type Aspect = keyof typeof ASPECT_DATA;
export type Transitivity = keyof typeof TRANSITIVITY_DATA;
export type VerbFeature = {tense: Tense, aspect: Aspect, transitivity: Transitivity};