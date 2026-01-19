/**
 * Sanskrit detection for Tibetan text
 * Ported from Botok's has_skrt_syl.py
 *
 * Detects Sanskrit syllables in Tibetan script based on:
 * 1. Sanskrit-specific vowels (long vowels, vocalic R/L)
 * 2. Sanskrit consonants (retroflex, aspirated)
 * 3. Invalid Tibetan consonant clusters that are valid in Sanskrit
 */

import { TSEK } from './constants.js';
import { CharMarkers as c } from './constants.js';

/**
 * Sanskrit-specific characters in Tibetan script
 */

// Sanskrit long vowels and special vowel marks
const SKRT_LONG_VOWELS = new Set([
  '\u0F71',  // ཱ - long a
  '\u0F72',  // ི - vowel i (can combine with ཱ)
  '\u0F73',  // ཱི - long i
  '\u0F74',  // ུ - vowel u (can combine with ཱ)
  '\u0F75',  // ཱུ - long u
  '\u0F76',  // ྲྀ - vocalic r
  '\u0F77',  // ཷ - long vocalic r
  '\u0F78',  // ླྀ - vocalic l
  '\u0F79',  // ཹ - long vocalic l
  '\u0F7A',  // ེ - vowel e
  '\u0F7B',  // ཻ - ai vowel (Sanskrit)
  '\u0F7C',  // ོ - vowel o
  '\u0F7D',  // ཽ - au vowel (Sanskrit)
  '\u0F7E',  // ཾ - anusvara
  '\u0F7F',  // ཿ - visarga
  '\u0F80',  // ྀ - reversed i
  '\u0F81',  // ཱྀ - reversed long i
  '\u0F82',  // ྂ - candrabindu
  '\u0F83',  // ྃ - candrabindu with ornament
]);

// Retroflex consonants (Sanskrit-specific)
const SKRT_RETROFLEX = new Set([
  '\u0F4A',  // ཊ - ta retroflex
  '\u0F4B',  // ཋ - tha retroflex
  '\u0F4C',  // ཌ - da retroflex
  '\u0F4D',  // ཌྷ - dda
  '\u0F4E',  // ཎ - na retroflex
  '\u0F65',  // ཥ - ssa (retroflex sha)
]);

// Aspirated consonants subjoined forms (these indicate Sanskrit)
const SKRT_ASPIRATION_MARKS = new Set([
  '\u0FB7',  // ྷ - subjoined ha (aspiration mark)
]);

// Base consonants that form aspirated pairs in Sanskrit
const SKRT_ASPIRATABLE_BASES = new Set([
  '\u0F42',  // ག - ga
  '\u0F4C',  // ཌ - retroflex da
  '\u0F51',  // ད - da
  '\u0F56',  // བ - ba
  '\u0F5B',  // ཛ - dza
]);

// Subjoined retroflex consonants
const SKRT_SUB_RETROFLEX = new Set([
  '\u0F9A',  // ྚ - subjoined retroflex ta
  '\u0F9B',  // ྛ - subjoined retroflex tha
  '\u0F9C',  // ྜ - subjoined retroflex da
  '\u0F9D',  // ྜྷ - subjoined retroflex dha
  '\u0F9E',  // ྞ - subjoined retroflex na
  '\u0FA5',  // ྥ - subjoined sha
]);

// Special Sanskrit consonants and clusters
const SKRT_SPECIAL_CONS = new Set([
  '\u0F69',  // ཀྵ - kssa
  '\u0F6B',  // ཫ - kka
  '\u0F6C',  // ཬ - rra
  '\u0FB5',  // ྵ - subjoined ssa
  '\u0FB9',  // ྐྵ - subjoined kssa
]);

// Tsa-phru mark (Chinese transliteration)
const TSA_PHRU = '\u0F39';

/**
 * Check if a syllable contains Sanskrit features
 * @param {string} syllable - Single Tibetan syllable (without tsek)
 * @returns {boolean} True if Sanskrit features detected
 */
export function isSanskritSyllable(syllable) {
  if (!syllable) return false;

  let prevChar = null;

  for (let i = 0; i < syllable.length; i++) {
    const char = syllable[i];

    // Check for Sanskrit long vowels (ཱ and combinations)
    if (char === '\u0F71') {  // ཱ - the long vowel mark
      return true;
    }

    // Check for other Sanskrit-specific vowels
    if (SKRT_LONG_VOWELS.has(char)) {
      // ཻ (ai) and ཽ (au) are Sanskrit-specific
      if (char === '\u0F7B' || char === '\u0F7D') {
        return true;
      }
      // Anusvara (ཾ) is Sanskrit-specific
      if (char === '\u0F7E') {
        return true;
      }
      // Visarga (ཿ) is Sanskrit-specific
      if (char === '\u0F7F') {
        return true;
      }
      // Vocalic R/L
      if (char >= '\u0F76' && char <= '\u0F79') {
        return true;
      }
      // Candrabindu marks
      if (char === '\u0F82' || char === '\u0F83') {
        return true;
      }
      // Reversed vowels
      if (char === '\u0F80' || char === '\u0F81') {
        return true;
      }
    }

    // Check for retroflex consonants
    if (SKRT_RETROFLEX.has(char)) {
      return true;
    }

    // Check for subjoined retroflex
    if (SKRT_SUB_RETROFLEX.has(char)) {
      return true;
    }

    // Check for aspirated consonants (base + ྷ)
    if (char === '\u0FB7' && prevChar && SKRT_ASPIRATABLE_BASES.has(prevChar)) {
      return true;
    }

    // Check for special Sanskrit consonants
    if (SKRT_SPECIAL_CONS.has(char)) {
      return true;
    }

    // Check for tsa-phru mark
    if (char === TSA_PHRU) {
      return true;
    }

    // Check for subjoined ha after aspiratable consonants in subjoined form
    if (char === '\u0FB7') {
      // Check if previous was a subjoined aspiratable: ྒ ྜ ྡ ྦ ྫ
      if (prevChar === '\u0F92' ||  // ྒ
          prevChar === '\u0F9C' ||  // ྜ
          prevChar === '\u0FA1' ||  // ྡ
          prevChar === '\u0FA6' ||  // ྦ
          prevChar === '\u0FAB') {  // ྫ
        return true;
      }
    }

    prevChar = char;
  }

  return false;
}

/**
 * Check if a word (potentially multi-syllable) contains any Sanskrit syllables
 * @param {string} word - Tibetan word (may contain tseks)
 * @returns {boolean} True if any syllable is Sanskrit
 */
export function hasSanskritSyllable(word) {
  if (!word) return false;

  // First check the whole word directly
  if (isSanskritSyllable(word.replace(new RegExp(TSEK, 'g'), ''))) {
    return true;
  }

  // Then check individual syllables
  const syllables = word.trim().replace(new RegExp(TSEK + '+$'), '').split(TSEK);

  for (const syl of syllables) {
    if (syl && isSanskritSyllable(syl)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if character categories contain Sanskrit markers
 * @param {Map<number, number>} charCategories - Map of index to category
 * @returns {boolean} True if Sanskrit character categories found
 */
export function hasSanskritCharCategory(charCategories) {
  for (const cat of charCategories.values()) {
    if (
      cat === c.SKRT_VOW ||
      cat === c.SKRT_CONS ||
      cat === c.SKRT_SUB_CONS ||
      cat === c.SKRT_LONG_VOW
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Combined Sanskrit detection using both character categories and pattern matching
 * @param {Map<number, number>} charCategories - Character categories
 * @param {string} word - The word text
 * @returns {boolean} True if Sanskrit detected
 */
export function isSanskrit(charCategories, word) {
  return hasSanskritCharCategory(charCategories) || hasSanskritSyllable(word);
}
