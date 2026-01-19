/**
 * Tests for the tokenizer
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { WordTokenizer, createTokenizer, quickTokenize, TokChunks, Trie } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('QuickTokenize', () => {
  it('should split Tibetan text into syllables', () => {
    const text = 'བཀྲ་ཤིས་བདེ་ལེགས།';
    const syls = quickTokenize(text);

    assert.strictEqual(syls.length, 4);
    assert.strictEqual(syls[0], 'བཀྲ');
    assert.strictEqual(syls[1], 'ཤིས');
    assert.strictEqual(syls[2], 'བདེ');
    assert.strictEqual(syls[3], 'ལེགས');
  });

  it('should handle Sanskrit mantras', () => {
    const text = 'ཨོཾ་མ་ཎི་པདྨེ་ཧཱུཾ།';
    const syls = quickTokenize(text);

    assert.strictEqual(syls.length, 5);
    assert.strictEqual(syls[0], 'ཨོཾ');
    assert.strictEqual(syls[4], 'ཧཱུཾ');
  });

  it('should handle text without tsek at end', () => {
    const text = 'བོད་སྐད';
    const syls = quickTokenize(text);

    assert.strictEqual(syls.length, 2);
    assert.strictEqual(syls[0], 'བོད');
    assert.strictEqual(syls[1], 'སྐད');
  });
});

describe('WordTokenizer', () => {
  describe('without dictionary', () => {
    let tokenizer;

    before(() => {
      tokenizer = new WordTokenizer();
    });

    it('should tokenize text into individual syllables', () => {
      const text = 'བཀྲ་ཤིས་བདེ་ལེགས།';
      const tokens = tokenizer.tokenize(text);

      // Without dictionary, each syllable becomes a separate token
      assert.ok(tokens.length >= 4);
    });

    it('should handle punctuation', () => {
      const text = 'བདེ་ལེགས།';
      const tokens = tokenizer.tokenize(text);

      // Should have tokens for syllables and punctuation
      assert.ok(tokens.length >= 2);

      // Check that shad is captured
      const hasShad = tokens.some(t => t.text.includes('།'));
      assert.ok(hasShad);
    });

    it('should preserve start positions', () => {
      const text = 'བོད་སྐད།';
      const tokens = tokenizer.tokenize(text);

      // First token should start at 0
      assert.strictEqual(tokens[0].start, 0);

      // Verify positions are sequential
      for (let i = 1; i < tokens.length; i++) {
        assert.ok(tokens[i].start >= tokens[i-1].start);
      }
    });

    it('should handle empty string', () => {
      const tokens = tokenizer.tokenize('');
      assert.strictEqual(tokens.length, 0);
    });
  });

  describe('with dictionary', () => {
    let tokenizer;

    before(() => {
      // Create a simple test dictionary
      const testDict = {
        words: [
          { word: 'བཀྲ་ཤིས་', pos: 'NOUN' },
          { word: 'བཀྲ་ཤིས', pos: 'NOUN' },  // Without trailing tsek
          { word: 'བདེ་ལེགས་', pos: 'NOUN' },
          { word: 'བདེ་ལེགས', pos: 'NOUN' },  // Without trailing tsek (before shad)
          { word: 'བོད་', pos: 'PROPN' },
          { word: 'སྐད་', pos: 'NOUN' },
          { word: 'ལ་', pos: 'PART' },
          { word: 'ནས་', pos: 'PART' },
          { word: 'ཡིན་', pos: 'VERB' },
        ]
      };

      tokenizer = createTokenizer({ dictionary: testDict });
    });

    it('should recognize multi-syllable words', () => {
      const text = 'བཀྲ་ཤིས་བདེ་ལེགས།';
      const tokens = tokenizer.tokenize(text);

      // Should recognize as two words + punctuation
      const textTokens = tokens.filter(t => t.chunkType === 'TEXT');
      assert.strictEqual(textTokens.length, 2);
      assert.strictEqual(textTokens[0].text, 'བཀྲ་ཤིས་');
      // Note: no trailing tsek before shad in proper Tibetan writing
      assert.strictEqual(textTokens[1].text, 'བདེ་ལེགས');
    });

    it('should get POS from dictionary', () => {
      const text = 'བོད་སྐད་';
      const tokens = tokenizer.tokenize(text);

      const textTokens = tokens.filter(t => t.chunkType === 'TEXT');
      assert.strictEqual(textTokens[0].pos, 'PROPN');
      assert.strictEqual(textTokens[1].pos, 'NOUN');
    });

    it('should handle mixed known and unknown words', () => {
      const text = 'བོད་ཀྱི་';  // བོད is known, ཀྱི is unknown
      const tokens = tokenizer.tokenize(text);

      const textTokens = tokens.filter(t => t.chunkType === 'TEXT');
      assert.ok(textTokens.length >= 1);
      assert.strictEqual(textTokens[0].text, 'བོད་');
    });
  });

  describe('tokenizeToStrings', () => {
    it('should return array of strings', () => {
      const tokenizer = new WordTokenizer();
      const result = tokenizer.tokenizeToStrings('བོད་སྐད།');

      assert.ok(Array.isArray(result));
      assert.ok(result.every(s => typeof s === 'string'));
    });
  });

  describe('segment', () => {
    it('should return space-separated text', () => {
      const tokenizer = new WordTokenizer();
      const result = tokenizer.segment('བོད་སྐད།');

      assert.ok(typeof result === 'string');
      // Should have segments separated by spaces
      assert.ok(result.includes(' ') || result.length > 0);
    });
  });

  describe('Sanskrit detection', () => {
    let tokenizer;

    before(() => {
      tokenizer = new WordTokenizer();
    });

    it('should mark Sanskrit syllables', () => {
      const text = 'ཧཱུཾ་';  // HUM seed syllable
      const tokens = tokenizer.tokenize(text);

      const textTokens = tokens.filter(t => t.chunkType === 'TEXT');
      assert.ok(textTokens.length >= 1);
      assert.strictEqual(textTokens[0].skrt, true);
    });

    it('should not mark pure Tibetan as Sanskrit', () => {
      const text = 'བདེ་';
      const tokens = tokenizer.tokenize(text);

      const textTokens = tokens.filter(t => t.chunkType === 'TEXT');
      assert.ok(textTokens.length >= 1);
      assert.strictEqual(textTokens[0].skrt, false);
    });

    it('should detect Sanskrit mantras', () => {
      const text = 'ཨོཾ་མ་ཎི་པདྨེ་ཧཱུཾ།';
      const tokens = tokenizer.tokenize(text);

      const textTokens = tokens.filter(t => t.chunkType === 'TEXT');

      // OM syllable should be Sanskrit
      const omToken = textTokens.find(t => t.text.includes('ཨོཾ'));
      assert.ok(omToken);
      assert.strictEqual(omToken.skrt, true);
    });
  });
});

describe('Token', () => {
  let tokenizer;

  before(() => {
    tokenizer = new WordTokenizer();
  });

  it('should have correct structure', () => {
    const tokens = tokenizer.tokenize('བདེ་');

    assert.ok(tokens.length >= 1);
    const token = tokens[0];

    assert.ok('text' in token);
    assert.ok('start' in token);
    assert.ok('len' in token);
    assert.ok('syls' in token);
    assert.ok('chunkType' in token);
    assert.ok('skrt' in token);
    assert.ok('senses' in token);
  });

  it('should have syllables array', () => {
    const tokens = tokenizer.tokenize('བདེ་');
    const textTokens = tokens.filter(t => t.chunkType === 'TEXT');

    assert.ok(textTokens.length >= 1);
    assert.ok(Array.isArray(textTokens[0].syls));
    assert.strictEqual(textTokens[0].syls[0], 'བདེ');
  });

  it('should have toString method', () => {
    const tokens = tokenizer.tokenize('བདེ་');
    const str = tokens[0].toString();

    assert.ok(typeof str === 'string');
    assert.ok(str.includes('text:'));
  });
});

describe('createTokenizer', () => {
  it('should create tokenizer without options', () => {
    const tokenizer = createTokenizer();
    assert.ok(tokenizer instanceof WordTokenizer);
  });

  it('should create tokenizer with dictionary', () => {
    const dict = { words: [{ word: 'བདེ་', pos: 'ADJ' }] };
    const tokenizer = createTokenizer({ dictionary: dict });

    const tokens = tokenizer.tokenize('བདེ་');
    const textTokens = tokens.filter(t => t.chunkType === 'TEXT');

    assert.strictEqual(textTokens[0].pos, 'ADJ');
  });
});

describe('TokChunks', () => {
  describe('makeChunks', () => {
    it('should chunk Tibetan text', () => {
      const tc = new TokChunks('བདེ་ལེགས།');
      const chunks = tc.makeChunks();

      assert.ok(Array.isArray(chunks));
      assert.ok(chunks.length > 0);
    });

    it('should handle mixed scripts', () => {
      const tc = new TokChunks('བདེ་ལེགས Hello');
      const chunks = tc.makeChunks();

      assert.ok(chunks.length > 0);
      // Should have both Tibetan and Latin chunks
    });
  });

  describe('getSyls', () => {
    it('should return syllables as strings', () => {
      const tc = new TokChunks('བཀྲ་ཤིས།');
      const syls = tc.getSyls();

      assert.deepStrictEqual(syls, ['བཀྲ', 'ཤིས']);
    });
  });
});

describe('Edge cases', () => {
  let tokenizer;

  before(() => {
    tokenizer = new WordTokenizer();
  });

  it('should handle multiple shads', () => {
    const text = 'བདེ།།';
    const tokens = tokenizer.tokenize(text);
    assert.ok(tokens.length >= 1);
  });

  it('should handle text starting with punctuation', () => {
    const text = '།བདེ་';
    const tokens = tokenizer.tokenize(text);
    assert.ok(tokens.length >= 1);
  });

  it('should handle only punctuation', () => {
    const text = '།';
    const tokens = tokenizer.tokenize(text);
    assert.ok(tokens.length >= 1);
  });

  it('should handle numbers in Tibetan', () => {
    const text = '༡༢༣';  // Tibetan digits
    const tokens = tokenizer.tokenize(text);
    assert.ok(tokens.length >= 1);
  });

  it('should handle long text', () => {
    const text = 'བོད་ཀྱི་སྐད་ཡིག་ནི་བོད་པའི་སྐད་ཆ་དང་ཡི་གེ་ཡིན།';
    const tokens = tokenizer.tokenize(text);
    assert.ok(tokens.length > 0);
  });

  it('should handle tsek-less syllables at end', () => {
    const text = 'བདེ་ལེགས';  // No tsek after ལེགས
    const tokens = tokenizer.tokenize(text);

    const textTokens = tokens.filter(t => t.chunkType === 'TEXT');
    assert.ok(textTokens.length >= 2);
  });
});
