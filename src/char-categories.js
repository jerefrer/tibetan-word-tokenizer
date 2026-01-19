/**
 * Character category mappings for Tibetan Unicode
 * Ported from Botok's bo_uni_table.csv
 */

import { CharMarkers as c } from './constants.js';

/**
 * Tibetan Unicode character categories
 * Derived from Botok's bo_uni_table.csv
 */
const tibetanCharCategories = {
  // Special/NFC characters
  '\u0F00': c.NFC,  // ༀ TIBETAN SYLLABLE OM

  // Punctuation marks
  '\u0F01': c.SPECIAL_PUNCT,  // ༁
  '\u0F02': c.SPECIAL_PUNCT,  // ༂
  '\u0F03': c.SPECIAL_PUNCT,  // ༃
  '\u0F04': c.NORMAL_PUNCT,   // ༄
  '\u0F05': c.NORMAL_PUNCT,   // ༅
  '\u0F06': c.NORMAL_PUNCT,   // ༆
  '\u0F07': c.SPECIAL_PUNCT,  // ༇
  '\u0F08': c.NORMAL_PUNCT,   // ༈
  '\u0F09': c.SPECIAL_PUNCT,  // ༉
  '\u0F0A': c.SPECIAL_PUNCT,  // ༊
  '\u0F0B': c.TSEK,           // ་ TSHEG
  '\u0F0C': c.TSEK,           // ༌ DELIMITER TSHEG
  '\u0F0D': c.NORMAL_PUNCT,   // །
  '\u0F0E': c.NORMAL_PUNCT,   // ༎
  '\u0F0F': c.NORMAL_PUNCT,   // ༏
  '\u0F10': c.NORMAL_PUNCT,   // ༐
  '\u0F11': c.NORMAL_PUNCT,   // ༑
  '\u0F12': c.SPECIAL_PUNCT,  // ༒
  '\u0F13': c.SYMBOL,         // ༓
  '\u0F14': c.NORMAL_PUNCT,   // ༔

  // Symbols
  '\u0F15': c.SYMBOL,  // ༕
  '\u0F16': c.SYMBOL,  // ༖
  '\u0F17': c.SYMBOL,  // ༗
  '\u0F18': c.SYMBOL,  // ༘
  '\u0F19': c.SYMBOL,  // ༙
  '\u0F1A': c.SYMBOL,  // ༚
  '\u0F1B': c.SYMBOL,  // ༛
  '\u0F1C': c.SYMBOL,  // ༜
  '\u0F1D': c.SYMBOL,  // ༝
  '\u0F1E': c.SYMBOL,  // ༞
  '\u0F1F': c.SYMBOL,  // ༟

  // Numerals
  '\u0F20': c.NUMERAL,  // ༠
  '\u0F21': c.NUMERAL,  // ༡
  '\u0F22': c.NUMERAL,  // ༢
  '\u0F23': c.NUMERAL,  // ༣
  '\u0F24': c.NUMERAL,  // ༤
  '\u0F25': c.NUMERAL,  // ༥
  '\u0F26': c.NUMERAL,  // ༦
  '\u0F27': c.NUMERAL,  // ༧
  '\u0F28': c.NUMERAL,  // ༨
  '\u0F29': c.NUMERAL,  // ༩

  // Half numerals (symbols)
  '\u0F2A': c.SYMBOL,  // ༪
  '\u0F2B': c.SYMBOL,  // ༫
  '\u0F2C': c.SYMBOL,  // ༬
  '\u0F2D': c.SYMBOL,  // ༭
  '\u0F2E': c.SYMBOL,  // ༮
  '\u0F2F': c.SYMBOL,  // ༯
  '\u0F30': c.SYMBOL,  // ༰
  '\u0F31': c.SYMBOL,  // ༱
  '\u0F32': c.SYMBOL,  // ༲
  '\u0F33': c.SYMBOL,  // ༳

  // More punctuation
  '\u0F34': c.NORMAL_PUNCT,  // ༴

  // In-syllable marks
  '\u0F35': c.IN_SYL_MARK,  // ༵
  '\u0F36': c.SYMBOL,       // ༶
  '\u0F37': c.IN_SYL_MARK,  // ༷
  '\u0F38': c.IN_SYL_MARK,  // ༸
  '\u0F39': c.SYMBOL,       // ༹ TSA-PHRU

  // Brackets
  '\u0F3A': c.SPECIAL_PUNCT,  // ༺
  '\u0F3B': c.SPECIAL_PUNCT,  // ༻
  '\u0F3C': c.NORMAL_PUNCT,   // ༼
  '\u0F3D': c.NORMAL_PUNCT,   // ༽
  '\u0F3E': c.SPECIAL_PUNCT,  // ༾
  '\u0F3F': c.SPECIAL_PUNCT,  // ༿

  // Consonants
  '\u0F40': c.CONS,  // ཀ KA
  '\u0F41': c.CONS,  // ཁ KHA
  '\u0F42': c.CONS,  // ག GA
  '\u0F43': c.NFC,   // གྷ GHA (NFC)
  '\u0F44': c.CONS,  // ང NGA
  '\u0F45': c.CONS,  // ཅ CA
  '\u0F46': c.CONS,  // ཆ CHA
  '\u0F47': c.CONS,  // ཇ JA
  '\u0F48': c.NFC,   // ཈ (reserved)
  '\u0F49': c.CONS,  // ཉ NYA
  '\u0F4A': c.SKRT_CONS,  // ཊ TTA (Sanskrit)
  '\u0F4B': c.SKRT_CONS,  // ཋ TTHA (Sanskrit)
  '\u0F4C': c.SKRT_CONS,  // ཌ DDA (Sanskrit)
  '\u0F4D': c.NFC,        // ཌྷ DDHA (NFC)
  '\u0F4E': c.SKRT_CONS,  // ཎ NNA (Sanskrit)
  '\u0F4F': c.CONS,  // ཏ TA
  '\u0F50': c.CONS,  // ཐ THA
  '\u0F51': c.CONS,  // ད DA
  '\u0F52': c.NFC,   // དྷ DHA (NFC)
  '\u0F53': c.CONS,  // ན NA
  '\u0F54': c.CONS,  // པ PA
  '\u0F55': c.CONS,  // ཕ PHA
  '\u0F56': c.CONS,  // བ BA
  '\u0F57': c.NFC,   // བྷ BHA (NFC)
  '\u0F58': c.CONS,  // མ MA
  '\u0F59': c.CONS,  // ཙ TSA
  '\u0F5A': c.CONS,  // ཚ TSHA
  '\u0F5B': c.CONS,  // ཛ DZA
  '\u0F5C': c.NFC,   // ཛྷ DZHA (NFC)
  '\u0F5D': c.CONS,  // ཝ WA
  '\u0F5E': c.CONS,  // ཞ ZHA
  '\u0F5F': c.CONS,  // ཟ ZA
  '\u0F60': c.CONS,  // འ -A
  '\u0F61': c.CONS,  // ཡ YA
  '\u0F62': c.CONS,  // ར RA
  '\u0F63': c.CONS,  // ལ LA
  '\u0F64': c.CONS,  // ཤ SHA
  '\u0F65': c.SKRT_CONS,  // ཥ SSA (Sanskrit)
  '\u0F66': c.CONS,  // ས SA
  '\u0F67': c.CONS,  // ཧ HA
  '\u0F68': c.CONS,  // ཨ A
  '\u0F69': c.NFC,   // ཀྵ KSSA (NFC)
  '\u0F6A': c.CONS,  // ཪ fixed-form RA
  '\u0F6B': c.NON_BO_NON_SKRT,  // ཫ KKA
  '\u0F6C': c.NON_BO_NON_SKRT,  // ཬ RRA

  // Vowels
  '\u0F71': c.SKRT_SUB_CONS,  // ཱ AA (long vowel - Sanskrit)
  '\u0F72': c.VOW,            // ི I
  '\u0F73': c.NFC,            // ཱི II (NFC)
  '\u0F74': c.VOW,            // ུ U
  '\u0F75': c.NFC,            // ཱུ UU (NFC)
  '\u0F76': c.NFC,            // ྲྀ vocalic R (NFC)
  '\u0F77': c.NFC,            // ཷ vocalic RR (NFC)
  '\u0F78': c.NFC,            // ླྀ vocalic L (NFC)
  '\u0F79': c.NFC,            // ཹ vocalic LL (NFC)
  '\u0F7A': c.VOW,            // ེ E
  '\u0F7B': c.SKRT_VOW,       // ཻ EE (Sanskrit)
  '\u0F7C': c.VOW,            // ོ O
  '\u0F7D': c.SKRT_VOW,       // ཽ OO (Sanskrit)
  '\u0F7E': c.IN_SYL_MARK,    // ཾ anusvara/bindu
  '\u0F7F': c.SKRT_LONG_VOW,  // ཿ visarga (Sanskrit)
  '\u0F80': c.SKRT_VOW,       // ྀ reversed I (Sanskrit)
  '\u0F81': c.NFC,            // ཱྀ reversed II (NFC)
  '\u0F82': c.SKRT_VOW,       // ྂ (Sanskrit)
  '\u0F83': c.SKRT_VOW,       // ྃ (Sanskrit)
  '\u0F84': c.SKRT_VOW,       // ྄ halanta (Sanskrit)
  '\u0F85': c.SKRT_CONS,      // ྅ paluta (Sanskrit)
  '\u0F86': c.SKRT_VOW,       // ྆
  '\u0F87': c.SYMBOL,         // ྇

  // Head letters (symbols)
  '\u0F88': c.SYMBOL,  // ྈ
  '\u0F89': c.SYMBOL,  // ྉ
  '\u0F8A': c.SYMBOL,  // ྊ
  '\u0F8B': c.SYMBOL,  // ྋ
  '\u0F8C': c.SYMBOL,  // ྌ
  '\u0F8D': c.SYMBOL,  // ྍ
  '\u0F8E': c.SYMBOL,  // ྎ
  '\u0F8F': c.SYMBOL,  // ྏ

  // Subjoined consonants
  '\u0F90': c.SUB_CONS,       // ྐ subjoined KA
  '\u0F91': c.SKRT_SUB_CONS,  // ྑ subjoined KHA (Sanskrit context)
  '\u0F92': c.SUB_CONS,       // ྒ subjoined GA
  '\u0F93': c.NFC,            // ྒྷ subjoined GHA (NFC)
  '\u0F94': c.SUB_CONS,       // ྔ subjoined NGA
  '\u0F95': c.SUB_CONS,       // ྕ subjoined CA
  '\u0F96': c.SKRT_SUB_CONS,  // ྖ subjoined CHA (Sanskrit context)
  '\u0F97': c.SUB_CONS,       // ྗ subjoined JA
  '\u0F99': c.SUB_CONS,       // ྙ subjoined NYA
  '\u0F9A': c.SKRT_SUB_CONS,  // ྚ subjoined TTA (Sanskrit)
  '\u0F9B': c.SKRT_SUB_CONS,  // ྛ subjoined TTHA (Sanskrit)
  '\u0F9C': c.SKRT_SUB_CONS,  // ྜ subjoined DDA (Sanskrit)
  '\u0F9D': c.NFC,            // ྜྷ subjoined DDHA (NFC)
  '\u0F9E': c.SKRT_SUB_CONS,  // ྞ subjoined NNA (Sanskrit)
  '\u0F9F': c.SUB_CONS,       // ྟ subjoined TA
  '\u0FA0': c.SKRT_SUB_CONS,  // ྠ subjoined THA (Sanskrit context)
  '\u0FA1': c.SUB_CONS,       // ྡ subjoined DA
  '\u0FA2': c.NFC,            // ྡྷ subjoined DHA (NFC)
  '\u0FA3': c.SUB_CONS,       // ྣ subjoined NA
  '\u0FA4': c.SUB_CONS,       // ྤ subjoined PA
  '\u0FA5': c.SKRT_SUB_CONS,  // ྥ subjoined PHA (Sanskrit context)
  '\u0FA6': c.SUB_CONS,       // ྦ subjoined BA
  '\u0FA7': c.NFC,            // ྦྷ subjoined BHA (NFC)
  '\u0FA8': c.SUB_CONS,       // ྨ subjoined MA
  '\u0FA9': c.SUB_CONS,       // ྩ subjoined TSA
  '\u0FAA': c.SKRT_SUB_CONS,  // ྪ subjoined TSHA (Sanskrit context)
  '\u0FAB': c.SUB_CONS,       // ྫ subjoined DZA
  '\u0FAC': c.NFC,            // ྫྷ subjoined DZHA (NFC)
  '\u0FAD': c.SUB_CONS,       // ྭ subjoined WA
  '\u0FAE': c.SKRT_SUB_CONS,  // ྮ subjoined ZHA (Sanskrit context)
  '\u0FAF': c.SKRT_SUB_CONS,  // ྯ subjoined ZA (Sanskrit context)
  '\u0FB0': c.SKRT_SUB_CONS,  // ྰ subjoined -A (Sanskrit)
  '\u0FB1': c.SUB_CONS,       // ྱ subjoined YA
  '\u0FB2': c.SUB_CONS,       // ྲ subjoined RA
  '\u0FB3': c.SUB_CONS,       // ླ subjoined LA
  '\u0FB4': c.SKRT_SUB_CONS,  // ྴ subjoined SHA (Sanskrit context)
  '\u0FB5': c.SKRT_SUB_CONS,  // ྵ subjoined SSA (Sanskrit)
  '\u0FB6': c.SKRT_SUB_CONS,  // ྶ subjoined SA (Sanskrit context)
  '\u0FB7': c.SUB_CONS,       // ྷ subjoined HA
  '\u0FB8': c.SKRT_SUB_CONS,  // ྸ subjoined A (Sanskrit)
  '\u0FB9': c.NFC,            // ྐྵ subjoined KSSA (NFC)
  '\u0FBA': c.SKRT_SUB_CONS,  // ྺ fixed-form subjoined WA (Sanskrit)
  '\u0FBB': c.SKRT_SUB_CONS,  // ྻ fixed-form subjoined YA (Sanskrit)
  '\u0FBC': c.SKRT_SUB_CONS,  // ྼ fixed-form subjoined RA (Sanskrit)

  // More symbols
  '\u0FBE': c.SYMBOL,  // ྾
  '\u0FBF': c.SYMBOL,  // ྿
  '\u0FC0': c.SYMBOL,  // ࿀
  '\u0FC1': c.SYMBOL,  // ࿁
  '\u0FC2': c.SYMBOL,  // ࿂
  '\u0FC3': c.SYMBOL,  // ࿃
  '\u0FC4': c.SYMBOL,  // ࿄
  '\u0FC5': c.SYMBOL,  // ࿅
  '\u0FC6': c.SYMBOL,  // ࿆
  '\u0FC7': c.SYMBOL,  // ࿇
  '\u0FC8': c.SYMBOL,  // ࿈
  '\u0FC9': c.SYMBOL,  // ࿉
  '\u0FCA': c.SYMBOL,  // ࿊
  '\u0FCB': c.SYMBOL,  // ࿋
  '\u0FCC': c.SYMBOL,  // ࿌
  '\u0FCE': c.SYMBOL,  // ࿎
  '\u0FCF': c.SYMBOL,  // ࿏
  '\u0FD0': c.SPECIAL_PUNCT,  // ࿐
  '\u0FD1': c.SPECIAL_PUNCT,  // ࿑
  '\u0FD2': c.SYMBOL,         // ࿒
  '\u0FD3': c.SPECIAL_PUNCT,  // ࿓
  '\u0FD4': c.SPECIAL_PUNCT,  // ࿔
  '\u0FD5': c.SYMBOL,  // ࿕
  '\u0FD6': c.SYMBOL,  // ࿖
  '\u0FD7': c.SYMBOL,  // ࿗
  '\u0FD8': c.SYMBOL,  // ࿘
  '\u0FD9': c.SPECIAL_PUNCT,  // ࿙
  '\u0FDA': c.SPECIAL_PUNCT,  // ࿚
};

/**
 * Characters that are treated as transparent (spaces, etc.)
 * These are allowed anywhere in text and don't affect tokenization
 */
const transparentChars = new Set([
  ' ',      // SPACE
  '\u180E', // MONGOLIAN VOWEL SEPARATOR
  '\u2000', // EN QUAD
  '\u2001', // EM QUAD
  '\u2002', // EN SPACE
  '\u2003', // EM SPACE
  '\u2004', // THREE-PER-EM SPACE
  '\u2005', // FOUR-PER-EM SPACE
  '\u2006', // SIX-PER-EM SPACE
  '\u2007', // FIGURE SPACE
  '\u2008', // PUNCTUATION SPACE
  '\u2009', // THIN SPACE
  '\u200A', // HAIR SPACE
  '\u200B', // ZERO WIDTH SPACE
  '\u202F', // NARROW NO-BREAK SPACE
  '\u205F', // MEDIUM MATHEMATICAL SPACE
  '\u3000', // IDEOGRAPHIC SPACE
  '\uFEFF', // ZERO WIDTH NO-BREAK SPACE
  '\t',     // TAB
  '\n',     // NEWLINE
  '\u00A0', // NON-BREAKING SPACE
]);

/**
 * Get the character category for a given character
 * @param {string} char - Single character
 * @returns {number} Character marker constant
 */
export function getCharCategory(char) {
  // Check transparent chars first
  if (transparentChars.has(char)) {
    return c.TRANSPARENT;
  }

  // Check Tibetan range (U+0F00 to U+0FFF)
  const code = char.charCodeAt(0);
  if (code >= 0x0F00 && code <= 0x0FFF) {
    const category = tibetanCharCategories[char];
    if (category !== undefined) {
      return category;
    }
    // Should not happen for valid Tibetan chars
    return c.OTHER;
  }

  // CJK range
  if (
    (code >= 0x2E80 && code <= 0xFAFF) ||
    (code >= 0xFE30 && code <= 0xFE4F) ||
    (code >= 0x20000 && code <= 0x2FA1F)
  ) {
    return c.CJK;
  }

  // Latin range
  // 1. Basic Latin to Combining Diacritical Marks
  // 2. Latin Extended Additional to Currency Symbols
  if (
    (code >= 0x0020 && code <= 0x036F) ||
    (code >= 0x1E00 && code <= 0x20CF)
  ) {
    return c.LATIN;
  }

  return c.OTHER;
}

/**
 * Check if a character is in the Tibetan Unicode range
 * @param {number} category - Character category
 * @returns {boolean}
 */
export function isTibetanCategory(category) {
  return (
    category !== c.OTHER &&
    category !== c.LATIN &&
    category !== c.CJK
  );
}

/**
 * Check if a character category indicates Sanskrit
 * @param {number} category - Character category
 * @returns {boolean}
 */
export function isSanskritCategory(category) {
  return (
    category === c.SKRT_CONS ||
    category === c.SKRT_SUB_CONS ||
    category === c.SKRT_VOW ||
    category === c.SKRT_LONG_VOW
  );
}
