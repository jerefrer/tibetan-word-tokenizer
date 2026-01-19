/**
 * tibetan-word-tokenizer
 *
 * A JavaScript port of Botok - Tibetan word tokenizer with Sanskrit detection
 * https://github.com/Esukhia/botok
 */

export * from './constants.js';
export * from './char-categories.js';
export * from './chunks.js';
export * from './trie.js';
export * from './tokenizer.js';
export * from './sanskrit.js';

// Re-export main classes as named exports for convenience
import { WordTokenizer, Token, Tokenize } from './tokenizer.js';
import { Trie, TrieNode } from './trie.js';
import { TokChunks, BoString, ChunkFramework } from './chunks.js';
import { isSanskritSyllable, hasSanskritSyllable, isSanskrit } from './sanskrit.js';

export {
  WordTokenizer,
  Token,
  Tokenize,
  Trie,
  TrieNode,
  TokChunks,
  BoString,
  ChunkFramework,
  isSanskritSyllable,
  hasSanskritSyllable,
  isSanskrit,
};

/**
 * Create a tokenizer with built-in dictionary
 * @param {Object} options - Configuration options
 * @param {Object} options.dictionary - Pre-loaded dictionary data
 * @returns {WordTokenizer}
 */
export function createTokenizer(options = {}) {
  const tokenizer = new WordTokenizer();

  if (options.dictionary) {
    tokenizer.loadDictionary(options.dictionary);
  }

  return tokenizer;
}

/**
 * Quick tokenization without loading full dictionary
 * Uses syllable boundaries only (less accurate but works without dictionary)
 * @param {string} text - Input text
 * @returns {string[]} Array of syllables/tokens
 */
export function quickTokenize(text) {
  const chunks = new TokChunks(text);
  return chunks.getSyls();
}

export default {
  WordTokenizer,
  Trie,
  TokChunks,
  createTokenizer,
  quickTokenize,
};
