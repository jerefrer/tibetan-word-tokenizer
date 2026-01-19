/**
 * Text chunking for Tibetan - splits text into syllables and other chunks
 * Ported from Botok's chunks.py and chunkframework.py
 */

import { CharMarkers as c, ChunkMarkers as u, NO_SHAD_CONS, VOWELS } from './constants.js';
import { getCharCategory, isTibetanCategory } from './char-categories.js';

/**
 * BoString - analyzes character types in a string
 */
export class BoString {
  /**
   * @param {string} text - Input text
   * @param {string[]} ignoreChars - Characters to treat as transparent
   */
  constructor(text, ignoreChars = []) {
    this.string = text;
    this.len = text.length;
    this.ignoreChars = new Set(ignoreChars);
    this.baseStructure = new Map();
    this._analyzeChars();
  }

  _analyzeChars() {
    for (let i = 0; i < this.len; i++) {
      const char = this.string[i];
      if (this.ignoreChars.has(char)) {
        this.baseStructure.set(i, c.TRANSPARENT);
      } else {
        this.baseStructure.set(i, getCharCategory(char));
      }
    }
  }

  /**
   * Get character category at index
   * @param {number} idx
   * @returns {number} Character marker
   */
  getCategory(idx) {
    return this.baseStructure.get(idx);
  }

  /**
   * Export categories for a slice
   * @param {number} start
   * @param {number} length
   * @returns {Map<number, number>}
   */
  exportGroups(start, length) {
    const result = new Map();
    for (let i = 0; i < length; i++) {
      result.set(i, this.baseStructure.get(start + i));
    }
    return result;
  }
}

/**
 * ChunkFramework - base class for text chunking
 */
export class ChunkFramework {
  /**
   * @param {string} text - Input text
   * @param {string[]} ignoreChars - Characters to ignore
   */
  constructor(text, ignoreChars = []) {
    this.bs = new BoString(text, ignoreChars);
  }

  /**
   * Generic chunking method
   * @param {number} start - Start index
   * @param {number} end - End index
   * @param {Function} conditionFunc - Test function
   * @returns {Array} Chunks as [isMatch, start, length] tuples
   */
  chunk(start, end, conditionFunc) {
    const chunks = [];
    let chunkStart = start;
    let length = 0;
    let prevState = null;

    for (let i = start; i < end; i++) {
      const currentState = conditionFunc.call(this, i);

      if (prevState === null) {
        prevState = currentState;
      }

      if (currentState === prevState) {
        length++;
      } else {
        chunks.push([prevState, chunkStart, length]);
        prevState = currentState;
        chunkStart += length;
        length = 1;
      }
    }

    // Final chunk
    if (length > 0) {
      chunks.push([prevState, chunkStart, length]);
    }

    return chunks;
  }

  /**
   * Chunk using a condition function with markers
   */
  chunkUsing(conditionFunc, start, end, yes, no) {
    if (start === null && end === null) {
      start = 0;
      end = this.bs.len;
    }

    const indices = this.chunk(start, end, conditionFunc);
    return indices.map(([isMatch, s, l]) => [isMatch ? yes : no, s, l]);
  }

  /**
   * Pipe chunking - re-chunk specific chunks
   */
  pipeChunk(chunks, chunkFunc, toChunkMarker, yes) {
    const result = [];

    for (const chunk of chunks) {
      if (chunk[0] === toChunkMarker) {
        const newChunks = chunkFunc.call(this, chunk[1], chunk[1] + chunk[2], yes);
        if (newChunks && newChunks.length > 0) {
          for (const newChunk of newChunks) {
            if (newChunk[0] !== yes) {
              result.push([chunk[0], newChunk[1], newChunk[2]]);
            } else {
              result.push(newChunk);
            }
          }
        } else {
          result.push(chunk);
        }
      } else {
        result.push(chunk);
      }
    }

    return result;
  }

  // Test methods
  _isBoUnicode(idx) {
    const cat = this.bs.getCategory(idx);
    return isTibetanCategory(cat);
  }

  _isPunct(idx) {
    const cat = this.bs.getCategory(idx);
    const prevCat = idx > 0 ? this.bs.getCategory(idx - 1) : null;

    // Special handling for punctuation after symbols/punct
    if (prevCat !== null) {
      const isPrevSpecial = (
        prevCat === c.SYMBOL ||
        prevCat === c.NUMERAL ||
        prevCat === c.OTHER ||
        prevCat === c.NORMAL_PUNCT ||
        prevCat === c.SPECIAL_PUNCT ||
        prevCat === c.TSEK ||
        prevCat === c.TRANSPARENT
      );
      const isCurrPunct = (
        cat === c.TSEK ||
        cat === c.TRANSPARENT ||
        cat === c.NORMAL_PUNCT
      );
      if (isPrevSpecial && isCurrPunct) {
        return true;
      }
    }

    return (
      cat === c.NORMAL_PUNCT ||
      cat === c.SPECIAL_PUNCT ||
      cat === c.TRANSPARENT
    );
  }

  _isSymbol(idx) {
    const cat = this.bs.getCategory(idx);
    return (
      cat === c.SYMBOL ||
      cat === c.TRANSPARENT ||
      cat === c.NFC
    );
  }

  _isNumeral(idx) {
    const cat = this.bs.getCategory(idx);
    return cat === c.NUMERAL || cat === c.TRANSPARENT;
  }

  _isSpace(idx) {
    return this.bs.getCategory(idx) === c.TRANSPARENT;
  }

  _isTsekOrLongSkrtVowel(idx) {
    const cat = this.bs.getCategory(idx);
    return cat === c.TSEK || cat === c.SKRT_LONG_VOW;
  }

  _isLatin(idx) {
    const cat = this.bs.getCategory(idx);
    return cat === c.LATIN || cat === c.TRANSPARENT;
  }

  _isCjk(idx) {
    const cat = this.bs.getCategory(idx);
    return cat === c.CJK || cat === c.TRANSPARENT;
  }

  // Chunking methods
  chunkBoChars(start = null, end = null, yes = u.BO, no = u.OTHER) {
    return this.chunkUsing(this._isBoUnicode, start, end, yes, no);
  }

  chunkPunct(start = null, end = null, yes = u.PUNCT, no = u.NON_PUNCT) {
    return this.chunkUsing(this._isPunct, start, end, yes, no);
  }

  chunkSymbol(start = null, end = null, yes = u.SYM, no = u.NON_SYM) {
    return this.chunkUsing(this._isSymbol, start, end, yes, no);
  }

  chunkNumber(start = null, end = null, yes = u.NUM, no = u.NON_NUM) {
    return this.chunkUsing(this._isNumeral, start, end, yes, no);
  }

  chunkSpaces(start = null, end = null, yes = u.SPACE, no = u.NON_SPACE) {
    return this.chunkUsing(this._isSpace, start, end, yes, no);
  }

  chunkLatin(start = null, end = null, yes = u.LATIN, no = u.OTHER) {
    return this.chunkUsing(this._isLatin, start, end, yes, no);
  }

  chunkCjk(start = null, end = null, yes = u.CJK, no = u.OTHER) {
    return this.chunkUsing(this._isCjk, start, end, yes, no);
  }

  /**
   * Syllabify - split Tibetan text into syllables
   */
  syllabify(start = null, end = null, yes = u.TEXT) {
    if (start === null && end === null) {
      start = 0;
      end = this.bs.len;
    }

    const indices = this.chunk(start, end, this._isTsekOrLongSkrtVowel);

    // Merge tsek with preceding syllable
    for (let i = 0; i < indices.length; i++) {
      if (indices[i][0] && i > 0 && !indices[i - 1][0]) {
        indices[i - 1] = [
          indices[i - 1][0],
          indices[i - 1][1],
          indices[i - 1][2] + indices[i][2]
        ];
        indices[i] = null;  // Mark for removal
      }
    }

    // Filter out nulls and tsek-only chunks, return syllables
    return indices
      .filter(chunk => chunk !== null && !chunk[0])
      .map(([_, s, l]) => [yes, s, l]);
  }

  /**
   * Adjust syllables for special cases
   */
  adjustSyls(start = null, end = null, yes = u.TEXT) {
    if (start === null && end === null) {
      start = 0;
      end = this.bs.len;
    }

    const indices = this.chunk(start, end, this._isSpace);

    for (let i = 0; i < indices.length; i++) {
      if (indices.length - 1 > i && i > 0 && indices[i][0]) {
        // Space chunk between text chunks
        const [_, s, e] = indices[i - 1];
        const text = this.bs.string.slice(s, s + e);

        // Check if preceding text ends with ཀ, ག, ཤ (optionally with vowel)
        const lastChar = text[text.length - 1];
        const secondLastChar = text.length >= 2 ? text[text.length - 2] : null;

        const endsWithNoShadCons = NO_SHAD_CONS.includes(lastChar);
        const endsWithVowelAfterNoShadCons = (
          VOWELS.includes(lastChar) &&
          secondLastChar &&
          NO_SHAD_CONS.includes(secondLastChar)
        );

        if (endsWithNoShadCons || endsWithVowelAfterNoShadCons) {
          // Merge space with preceding
          indices[i - 1] = [
            yes,
            indices[i - 1][1],
            indices[i - 1][2] + indices[i][2]
          ];
        } else {
          // Merge all three chunks
          indices[i - 1] = [
            indices[i - 1][0],
            indices[i - 1][1],
            indices[i - 1][2] + indices[i][2] + (indices[i + 1] ? indices[i + 1][2] : 0)
          ];
          if (indices[i + 1]) {
            indices[i + 1] = null;
          }
        }
        indices[i] = null;
      } else if (indices[i][0] === false) {
        indices[i] = [yes, indices[i][1], indices[i][2]];
      } else if ((i === 0 || i === indices.length - 1) && indices[i][0] === true) {
        indices[i] = [u.PUNCT, indices[i][1], indices[i][2]];
      }
    }

    // Filter out nulls
    const result = indices.filter(chunk => chunk !== null && chunk[0] !== true);
    return result.length > 1 ? result : [];
  }

  /**
   * Merge skippable punctuation (tsek and space) with adjacent chunks
   */
  mergeSkippablePunct(chunks) {
    const isSkippable = (idx) => {
      const cat = this.bs.getCategory(idx);
      return cat === c.TSEK || cat === c.TRANSPARENT;
    };

    let i = 0;
    while (i < chunks.length) {
      const current = chunks[i];

      // Check if entire chunk is skippable
      let allSkippable = true;
      for (let j = current[1]; j < current[1] + current[2]; j++) {
        if (!isSkippable(j)) {
          allSkippable = false;
          break;
        }
      }

      if (allSkippable) {
        if (i === 0 && chunks.length > 1) {
          // Merge with next
          chunks[1] = [chunks[1][0], current[1], chunks[1][2] + current[2]];
          chunks.splice(0, 1);
          continue;
        } else if (i > 0) {
          // Merge with previous
          chunks[i - 1] = [
            chunks[i - 1][0],
            chunks[i - 1][1],
            chunks[i - 1][2] + current[2]
          ];
          chunks.splice(i, 1);
          continue;
        }
      }
      i++;
    }

    return this.mergeSimilarChunks(chunks);
  }

  /**
   * Merge adjacent chunks with same marker (except TEXT)
   */
  mergeSimilarChunks(chunks) {
    let i = 1;
    while (i < chunks.length) {
      const prev = chunks[i - 1];
      const curr = chunks[i];

      if (
        prev[0] !== u.TEXT &&
        curr[0] !== u.TEXT &&
        prev[0] === curr[0]
      ) {
        chunks[i - 1] = [prev[0], prev[1], prev[2] + curr[2]];
        chunks.splice(i, 1);
      } else {
        i++;
      }
    }
    return chunks;
  }
}

/**
 * TokChunks - produces chunks suitable for tokenization
 */
export class TokChunks extends ChunkFramework {
  /**
   * @param {string} text - Input text
   * @param {string[]} ignoreChars - Characters to ignore
   * @param {boolean} spaceAsPunct - Treat space as punctuation
   */
  constructor(text, ignoreChars = [], spaceAsPunct = false) {
    super(text, ignoreChars);
    this.spaceAsPunct = spaceAsPunct;
    this.chunks = null;
  }

  /**
   * Make chunks for tokenization
   */
  makeChunks() {
    let chunks = this.chunkBoChars();

    if (this.spaceAsPunct) {
      chunks = this.pipeChunk(chunks, this.chunkSpaces, u.BO, u.PUNCT);
    }

    chunks = this.pipeChunk(chunks, this.chunkPunct, u.BO, u.PUNCT);
    chunks = this.pipeChunk(chunks, this.chunkSymbol, u.BO, u.SYM);
    chunks = this.pipeChunk(chunks, this.chunkNumber, u.BO, u.NUM);

    if (!this.spaceAsPunct) {
      chunks = this.mergeSkippablePunct(chunks);
    }

    chunks = this.pipeChunk(chunks, this.syllabify, u.BO, u.TEXT);
    chunks = this.pipeChunk(chunks, this.adjustSyls, u.TEXT, u.TEXT);
    chunks = this.pipeChunk(chunks, this.chunkCjk, u.OTHER, u.CJK);
    chunks = this.pipeChunk(chunks, this.chunkLatin, u.OTHER, u.LATIN);

    if (!this.spaceAsPunct) {
      chunks = this.mergeSkippablePunct(chunks);
    }

    return chunks;
  }

  /**
   * Prepare chunks for trie lookup
   * Returns array of [syllable_chars | null, chunk_info] tuples
   */
  serveSylsToTrie() {
    const chunks = this.makeChunks();
    this.chunks = [];

    for (const chunk of chunks) {
      if (chunk[0] === u.TEXT) {
        const sylChars = this._getTextChars(chunk[1], chunk[1] + chunk[2]);
        this.chunks.push([sylChars, chunk]);
      } else {
        this.chunks.push([null, chunk]);
      }
    }

    return this.chunks;
  }

  /**
   * Get syllables as strings
   */
  getSyls() {
    const chunks = this.makeChunks();
    const syls = [];

    for (const chunk of chunks) {
      if (chunk[0] === u.TEXT) {
        const charIdxs = this._getTextChars(chunk[1], chunk[1] + chunk[2]);
        const syl = charIdxs.map(i => this.bs.string[i]).join('');
        syls.push(syl);
      }
    }

    return syls;
  }

  /**
   * Get character indices for syllable text (excluding tsek and spaces)
   * @private
   */
  _getTextChars(start, end) {
    const chars = [];
    for (let i = start; i < end; i++) {
      if (this._isSylText(i)) {
        chars.push(i);
      }
    }
    return chars;
  }

  /**
   * Test if character is part of syllable text
   * @private
   */
  _isSylText(idx) {
    const cat = this.bs.getCategory(idx);
    return (
      cat !== c.TSEK &&
      cat !== c.TRANSPARENT
    ) || cat === c.SKRT_LONG_VOW;  // Visarga is part of syllable
  }
}
