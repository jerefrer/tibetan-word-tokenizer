/**
 * Constants for Tibetan word tokenizer
 * Ported from Botok (Python) - https://github.com/Esukhia/botok
 */

// Special characters
export const TSEK = '་';  // Tibetan syllable separator
export const NAMCHE = 'ཿ'; // Visarga
export const SHAD = '།';   // Tibetan full stop
export const AA = 'འ';     // A-chung
export const HASH = '#';

// Characters that can end a syllable without shad
export const NO_SHAD_CONS = ['ཀ', 'ག', 'ཤ'];
export const VOWELS = ['ི'];

// Dagdra particles (nominalizers)
export const DAGDRA = ['པ་', 'པོ་', 'བ་', 'བོ་'];

/**
 * Character markers - categories for each Tibetan Unicode character
 */
export const CharMarkers = {
  // Regular Tibetan
  CONS: 1,           // Consonant
  SUB_CONS: 2,       // Subjoined consonant
  VOW: 3,            // Vowel
  TSEK: 4,           // Tshek (syllable separator)

  // Punctuation
  NORMAL_PUNCT: 5,
  SPECIAL_PUNCT: 6,

  // Others
  NUMERAL: 7,
  SYMBOL: 8,
  IN_SYL_MARK: 9,
  NON_BO_NON_SKRT: 10,

  // Sanskrit-specific
  SKRT_CONS: 11,
  SKRT_SUB_CONS: 12,
  SKRT_VOW: 13,
  SKRT_LONG_VOW: 14,

  // Other languages
  CJK: 15,
  LATIN: 16,

  // Misc
  OTHER: 17,
  TRANSPARENT: 18,   // Spaces and ignorable characters
  NFC: 19,           // Characters needing NFC normalization
};

// Reverse lookup for char markers
export const charMarkerNames = Object.fromEntries(
  Object.entries(CharMarkers).map(([k, v]) => [v, k])
);

/**
 * Chunk markers - categories for text chunks
 */
export const ChunkMarkers = {
  // Languages
  BO: 100,
  LATIN: 101,
  CJK: 102,
  OTHER: 103,

  // Tibetan textual content
  TEXT: 104,

  // Tibetan non-textual content
  PUNCT: 105,
  NON_PUNCT: 106,
  SPACE: 107,
  NON_SPACE: 108,
  SYM: 109,
  NON_SYM: 110,
  NUM: 111,
  NON_NUM: 112,
};

// Reverse lookup for chunk markers
export const chunkMarkerNames = Object.fromEntries(
  Object.entries(ChunkMarkers).map(([k, v]) => [v, k])
);

/**
 * Word markers - categories for tokenized words
 */
export const WordMarkers = {
  WORD: 1000,
  NO_POS: 1001,
  NON_WORD: 1002,
};

// Reverse lookup for word markers
export const wordMarkerNames = Object.fromEntries(
  Object.entries(WordMarkers).map(([k, v]) => [v, k])
);
