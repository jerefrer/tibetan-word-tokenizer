/**
 * Tests for Sanskrit detection
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isSanskritSyllable, hasSanskritSyllable } from '../src/sanskrit.js';

describe('Sanskrit Detection', () => {
  describe('isSanskritSyllable', () => {
    it('should detect Sanskrit long vowels', () => {
      // ཧཱུཾ = HUM with long vowel ཱ and anusvara ཾ
      assert.strictEqual(isSanskritSyllable('ཧཱུཾ'), true);

      // ཨཱ = A with long vowel
      assert.strictEqual(isSanskritSyllable('ཨཱ'), true);
    });

    it('should detect Sanskrit aspirated consonants', () => {
      // གྷ = aspirated GA
      assert.strictEqual(isSanskritSyllable('གྷ'), true);

      // བྷ = aspirated BA
      assert.strictEqual(isSanskritSyllable('བྷ'), true);

      // དྷ = aspirated DA
      assert.strictEqual(isSanskritSyllable('དྷ'), true);
    });

    it('should detect Sanskrit retroflex consonants', () => {
      // ཊ = retroflex TA
      assert.strictEqual(isSanskritSyllable('ཊ'), true);

      // ཌ = retroflex DA
      assert.strictEqual(isSanskritSyllable('ཌ'), true);

      // ཎ = retroflex NA
      assert.strictEqual(isSanskritSyllable('ཎ'), true);
    });

    it('should not flag regular Tibetan syllables', () => {
      assert.strictEqual(isSanskritSyllable('བཀྲ'), false);
      assert.strictEqual(isSanskritSyllable('ཤིས'), false);
      assert.strictEqual(isSanskritSyllable('བདེ'), false);
      assert.strictEqual(isSanskritSyllable('ལེགས'), false);
      assert.strictEqual(isSanskritSyllable('བོད'), false);
      assert.strictEqual(isSanskritSyllable('སྐད'), false);
    });

    it('should detect anusvara (bindu)', () => {
      // ཾ = anusvara used in Sanskrit
      assert.strictEqual(isSanskritSyllable('ཨོཾ'), true);  // OM
    });

    it('should detect visarga', () => {
      // ཿ = visarga
      assert.strictEqual(isSanskritSyllable('ཨཱཿ'), true);  // AH
    });

    it('should detect vocalic vowels', () => {
      // ྲྀ = vocalic R (U+0F76)
      assert.strictEqual(isSanskritSyllable('ཀྲྀ'), true);
    });
  });

  describe('hasSanskritSyllable', () => {
    it('should detect Sanskrit in multi-syllable mantras', () => {
      // ཨོཾ་མ་ཎི་པདྨེ་ཧཱུཾ - has anusvara (ཾ) and retroflex (ཎ)
      assert.strictEqual(hasSanskritSyllable('ཨོཾ་མ་ཎི་པདྨེ་ཧཱུཾ'), true);
    });

    it('should detect Sanskrit from retroflex consonants', () => {
      // ཎི = ni with retroflex N
      assert.strictEqual(hasSanskritSyllable('མ་ཎི'), true);
    });

    it('should not flag pure Tibetan words', () => {
      assert.strictEqual(hasSanskritSyllable('བཀྲ་ཤིས་བདེ་ལེགས'), false);
      assert.strictEqual(hasSanskritSyllable('བོད་སྐད'), false);
      assert.strictEqual(hasSanskritSyllable('ཆོས'), false);
      assert.strictEqual(hasSanskritSyllable('སངས་རྒྱས'), false);
    });

    it('should handle words with trailing tsek', () => {
      assert.strictEqual(hasSanskritSyllable('ཧཱུཾ་'), true);
      assert.strictEqual(hasSanskritSyllable('བདེ་'), false);
    });

    it('should detect Sanskrit seed syllables', () => {
      // ཨོཾ = OM (has anusvara)
      assert.strictEqual(hasSanskritSyllable('ཨོཾ'), true);

      // ཨཱཿ = AH (has visarga)
      assert.strictEqual(hasSanskritSyllable('ཨཱཿ'), true);

      // ཧཱུཾ = HUM (has long vowel and anusvara)
      assert.strictEqual(hasSanskritSyllable('ཧཱུཾ'), true);
    });

    it('should handle empty and null input', () => {
      assert.strictEqual(hasSanskritSyllable(''), false);
      assert.strictEqual(hasSanskritSyllable(null), false);
    });
  });
});
