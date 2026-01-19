/**
 * Tibetan word tokenizer
 * Ported from Botok's tokenize.py and wordtokenizer.py
 */

import { TSEK, NAMCHE, ChunkMarkers as u, WordMarkers as w, chunkMarkerNames } from './constants.js';
import { TokChunks } from './chunks.js';
import { Trie } from './trie.js';
import { isSanskrit } from './sanskrit.js';

/**
 * Token - represents a tokenized word or chunk
 */
export class Token {
  constructor() {
    this.text = '';           // Original text
    this.textCleaned = '';    // Cleaned text (same as text for now)
    this.textUnaffixed = '';  // Text without affixes
    this.start = 0;           // Start position in original string
    this.len = 0;             // Length in original string
    this.syls = [];           // Syllables as strings
    this.sylsIdx = [];        // Syllable character indices
    this.sylsStartEnd = [];   // Syllable start/end positions
    this.chunkType = '';      // Type of chunk (TEXT, PUNCT, etc.)
    this.charTypes = [];      // Character type for each char
    this.pos = null;          // Part of speech
    this.lemma = null;        // Lemma form
    this.senses = [];         // Meanings/senses
    this.skrt = false;        // Is Sanskrit
    this.affixed = false;     // Has affix
    this.affix = false;       // Is an affix
    this.affixHost = false;   // Hosts an affix
  }

  /**
   * Get property from token or senses
   */
  get(key) {
    if (this[key] !== undefined) {
      return this[key];
    }
    if (this.senses.length > 0 && this.senses[0][key] !== undefined) {
      return this.senses[0][key];
    }
    return null;
  }

  toString() {
    let str = `text: "${this.text}"\n`;
    str += `start: ${this.start}, len: ${this.len}\n`;
    str += `chunkType: ${this.chunkType}\n`;
    if (this.syls.length > 0) {
      str += `syls: [${this.syls.map(s => `"${s}"`).join(', ')}]\n`;
    }
    if (this.pos) {
      str += `pos: ${this.pos}\n`;
    }
    if (this.skrt) {
      str += `skrt: true\n`;
    }
    return str;
  }
}

/**
 * Tokenize - core tokenization algorithm using trie
 */
export class Tokenize {
  /**
   * @param {Trie} trie - Dictionary trie
   */
  constructor(trie) {
    this.trie = trie;
    this.preProcessed = null;
  }

  /**
   * Tokenize preprocessed text
   * @param {TokChunks} preProcessed - Preprocessed text chunks
   * @returns {Token[]} Array of tokens
   */
  tokenize(preProcessed) {
    this.preProcessed = preProcessed;
    const tokens = [];

    let cIdx = 0;
    while (cIdx < preProcessed.chunks.length) {
      let walker = cIdx;
      const syls = [];
      const maxMatch = [];
      const matchData = new Map();
      let currentNode = null;
      let foundMaxMatch = false;

      while (true) {
        const [curSyl, chunkInfo] = preProcessed.chunks[walker];

        // Chunk is a syllable
        if (curSyl !== null) {
          const syl = curSyl.map(i => preProcessed.bs.string[i]).join('');
          currentNode = this.trie.walk(syl, currentNode);

          if (currentNode) {
            syls.push(walker);

            if (currentNode.isMatch()) {
              matchData.set(walker, currentNode.data);
              maxMatch.push([...syls]);

              // Check if matched is last chunk
              if (walker + 1 === preProcessed.chunks.length) {
                foundMaxMatch = true;
              }
            } else {
              if (walker + 1 === preProcessed.chunks.length) {
                if (maxMatch.length > 0) {
                  foundMaxMatch = true;
                } else {
                  // OOV syllables become independent tokens
                  this._addFoundWordOrNonWord(walker, matchData, syls, tokens);
                  cIdx += syls.length;
                  break;
                }
              }
            }
          } else {
            // Can't continue walking
            if (maxMatch.length > 0) {
              foundMaxMatch = true;
            } else {
              if (syls.length > 0) {
                cIdx = this._addFoundWordOrNonWord(walker, matchData, syls, tokens);
                break;
              } else {
                // Syllable not in dictionary
                const nonWord = [walker];
                tokens.push(this._chunksToToken(nonWord, {}, w.NON_WORD));
                cIdx += 1;
                break;
              }
            }
          }
        } else {
          // Chunk is non-syllable (punctuation, etc.)
          if (maxMatch.length > 0) {
            foundMaxMatch = true;
          } else if (syls.length > 0) {
            cIdx = this._addFoundWordOrNonWord(walker, matchData, syls, tokens);
            if (syls.length === 1) {
              cIdx += 1;
            }
            break;
          } else {
            // Non-syllable becomes its own token
            tokens.push(this._chunksToToken([cIdx], {}));
            cIdx += 1;
            break;
          }
        }

        if (foundMaxMatch) {
          const lastMaxMatch = maxMatch[maxMatch.length - 1];
          this._addFoundWordOrNonWord(
            cIdx + lastMaxMatch.length - 1,
            matchData,
            lastMaxMatch,
            tokens
          );
          cIdx += lastMaxMatch.length;
          break;
        }

        walker += 1;
        if (walker >= preProcessed.chunks.length) {
          // Reached end without finding more matches
          if (maxMatch.length > 0) {
            const lastMaxMatch = maxMatch[maxMatch.length - 1];
            this._addFoundWordOrNonWord(
              cIdx + lastMaxMatch.length - 1,
              matchData,
              lastMaxMatch,
              tokens
            );
            cIdx += lastMaxMatch.length;
          } else if (syls.length > 0) {
            this._addFoundWordOrNonWord(walker - 1, matchData, syls, tokens);
            cIdx += syls.length;
          }
          break;
        }
      }
    }

    this.preProcessed = null;
    return tokens;
  }

  /**
   * Add word or non-word token based on match data
   * @private
   */
  _addFoundWordOrNonWord(cIdx, matchData, syls, tokens) {
    if (matchData.has(cIdx)) {
      // There is a match
      const data = matchData.get(cIdx);
      const ttype = (!data.senses || data.senses.length === 0 ||
        !data.senses.some(m => m.pos)) ? w.NO_POS : null;
      tokens.push(this._chunksToToken(syls, data, ttype));
    } else if (matchData.size > 0) {
      // Use longest partial match
      const sortedKeys = Array.from(matchData.keys()).sort((a, b) => a - b);
      const nonMaxIdx = sortedKeys[sortedKeys.length - 1];
      const nonMaxSyls = syls.filter(s => s <= nonMaxIdx);
      const data = matchData.get(nonMaxIdx);
      const ttype = (!data.senses || data.senses.length === 0 ||
        !data.senses.some(m => m.pos)) ? w.NO_POS : null;
      tokens.push(this._chunksToToken(nonMaxSyls, data, ttype));
      return nonMaxIdx;
    } else {
      // No match - add first syllable as non-word
      tokens.push(this._chunksToToken([syls[0]], {}, w.NO_POS));

      // Decrement for retry
      if (syls.length > 1) {
        return cIdx - (syls.length - 1) - 1;
      }
    }
    return cIdx;
  }

  /**
   * Convert chunks to a token
   * @private
   */
  _chunksToToken(sylIndices, data, ttype = null) {
    const token = new Token();

    if (sylIndices.length === 1) {
      const [sylChars, chunkInfo] = this.preProcessed.chunks[sylIndices[0]];
      const [chunkType, chunkStart, chunkLen] = chunkInfo;

      token.text = this.preProcessed.bs.string.slice(chunkStart, chunkStart + chunkLen);
      token.start = chunkStart;
      token.len = chunkLen;
      token.chunkType = chunkMarkerNames[chunkType] || 'UNKNOWN';

      if (sylChars) {
        token.syls = [sylChars.map(i => this.preProcessed.bs.string[i]).join('')];
        token.sylsIdx = [sylChars.map(i => i - chunkStart)];
        token.sylsStartEnd = [{ start: 0, end: chunkLen }];
      }
    } else if (sylIndices.length > 1) {
      const firstChunk = this.preProcessed.chunks[sylIndices[0]];
      const lastChunk = this.preProcessed.chunks[sylIndices[sylIndices.length - 1]];

      const startPos = firstChunk[1][1];
      let totalLen = 0;

      token.syls = [];
      token.sylsIdx = [];
      token.sylsStartEnd = [];

      for (const idx of sylIndices) {
        const [sylChars, chunkInfo] = this.preProcessed.chunks[idx];
        const [_, chunkStart, chunkLen] = chunkInfo;

        totalLen += chunkLen;

        if (sylChars) {
          token.syls.push(sylChars.map(i => this.preProcessed.bs.string[i]).join(''));
          token.sylsIdx.push(sylChars.map(i => i - startPos));
          token.sylsStartEnd.push({
            start: chunkStart - startPos,
            end: chunkStart - startPos + chunkLen
          });
        }
      }

      token.text = this.preProcessed.bs.string.slice(startPos, startPos + totalLen);
      token.start = startPos;
      token.len = totalLen;
      token.chunkType = chunkMarkerNames[lastChunk[1][0]] || 'UNKNOWN';
    }

    // Set text cleaned and unaffixed
    token.textCleaned = token.text;
    token.textUnaffixed = token.text;

    // Copy data to token
    if (data) {
      if (data.senses) {
        token.senses = [...data.senses];
      }
      if (data.skrt) {
        token.skrt = data.skrt;
      }
    }

    // Set token type in senses
    if (ttype) {
      const typeName = ttype === w.NO_POS ? 'NO_POS' :
        ttype === w.NON_WORD ? 'NON_WORD' : 'WORD';

      if (token.senses.length === 0) {
        token.senses.push({ pos: typeName });
      } else {
        for (const sense of token.senses) {
          if (!sense.pos) {
            sense.pos = typeName;
          }
        }
      }
    }

    // Sanskrit detection
    if (!token.skrt && token.syls.length > 0) {
      const charGroups = this.preProcessed.bs.exportGroups(token.start, token.len);
      token.skrt = isSanskrit(charGroups, token.text);
    }

    // Set character types
    token.charTypes = [];
    for (let i = token.start; i < token.start + token.len; i++) {
      token.charTypes.push(this.preProcessed.bs.getCategory(i));
    }

    // Set POS from first sense if available
    if (token.senses.length > 0 && token.senses[0].pos) {
      token.pos = token.senses[0].pos;
    }

    return token;
  }
}

/**
 * WordTokenizer - main tokenizer class
 */
export class WordTokenizer {
  /**
   * @param {Trie} trie - Pre-built dictionary trie
   */
  constructor(trie = null) {
    this.trie = trie || new Trie();
    this.tokenizer = new Tokenize(this.trie);
  }

  /**
   * Load dictionary from JSON data
   * @param {Object} dictData - Dictionary data { words: [...] }
   */
  loadDictionary(dictData) {
    if (!dictData || !dictData.words) {
      return;
    }

    for (const entry of dictData.words) {
      const syllables = this._wordToSyllables(entry.word);
      if (syllables && syllables.length > 0) {
        const data = {};
        if (entry.pos || entry.lemma || entry.sense || entry.freq) {
          data.senses = [{
            pos: entry.pos || null,
            lemma: entry.lemma || null,
            sense: entry.sense || null,
            freq: entry.freq || null,
          }];
        }
        this.trie.add(syllables, data);
      }
    }
  }

  /**
   * Convert word to syllables for trie lookup
   * @private
   */
  _wordToSyllables(word) {
    // Use TokChunks to get clean syllables
    const chunks = new TokChunks(word);
    return chunks.getSyls();
  }

  /**
   * Tokenize a string
   * @param {string} text - Input text
   * @param {Object} options - Options
   * @param {boolean} options.spacesAsPunct - Treat spaces as punctuation
   * @returns {Token[]} Array of tokens
   */
  tokenize(text, options = {}) {
    const { spacesAsPunct = false } = options;

    const preProcessed = new TokChunks(text, [], spacesAsPunct);
    preProcessed.serveSylsToTrie();

    return this.tokenizer.tokenize(preProcessed);
  }

  /**
   * Tokenize and return simple word list
   * @param {string} text - Input text
   * @returns {string[]} Array of word strings
   */
  tokenizeToStrings(text) {
    const tokens = this.tokenize(text);
    return tokens.map(t => t.text);
  }

  /**
   * Segment text into words (space-separated string)
   * @param {string} text - Input text
   * @returns {string} Space-separated words
   */
  segment(text) {
    const tokens = this.tokenize(text);
    const words = [];

    for (const token of tokens) {
      // Skip pure punctuation/whitespace unless it's meaningful
      if (token.chunkType === 'TEXT' || token.chunkType === 'NUM' || token.chunkType === 'SYM') {
        words.push(token.text.trim());
      } else if (token.chunkType === 'PUNCT') {
        // Include punctuation that's not just whitespace
        const trimmed = token.text.trim();
        if (trimmed && trimmed !== TSEK) {
          words.push(trimmed);
        }
      }
    }

    return words.filter(w => w).join(' ');
  }
}
