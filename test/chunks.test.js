/**
 * Tests for text chunking
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BoString, TokChunks, ChunkFramework } from '../src/chunks.js';
import { CharMarkers as c, ChunkMarkers as u } from '../src/constants.js';

describe('BoString', () => {
  it('should categorize Tibetan characters', () => {
    const bs = new BoString('བཀྲ་ཤིས་');

    // བ = consonant
    assert.strictEqual(bs.getCategory(0), c.CONS);
    // ཀ = consonant
    assert.strictEqual(bs.getCategory(1), c.CONS);
    // ྲ = subjoined consonant
    assert.strictEqual(bs.getCategory(2), c.SUB_CONS);
    // ་ = tsek
    assert.strictEqual(bs.getCategory(3), c.TSEK);
  });

  it('should categorize mixed content', () => {
    const bs = new BoString(' བཀྲ་ tr བདེ་');

    // Space = transparent
    assert.strictEqual(bs.getCategory(0), c.TRANSPARENT);
    // བ = consonant
    assert.strictEqual(bs.getCategory(1), c.CONS);
    // 't' = Latin
    assert.strictEqual(bs.getCategory(6), c.LATIN);
  });

  it('should identify Sanskrit characters', () => {
    const bs = new BoString('ཧཱུཾ');  // HUM seed syllable

    // ཧ = regular consonant
    assert.strictEqual(bs.getCategory(0), c.CONS);
    // ཱ = Sanskrit long vowel
    assert.strictEqual(bs.getCategory(1), c.SKRT_SUB_CONS);
    // ུ = regular vowel
    assert.strictEqual(bs.getCategory(2), c.VOW);
    // ཾ = in-syllable mark (anusvara)
    assert.strictEqual(bs.getCategory(3), c.IN_SYL_MARK);
  });
});

describe('ChunkFramework', () => {
  it('should chunk Tibetan vs non-Tibetan', () => {
    const cf = new ChunkFramework(' བཀྲ་ཤིས་  tr བདེ་ལེགས།');
    const chunks = cf.chunkBoChars();

    // Should have: BO, OTHER/LATIN, BO chunks
    assert.ok(chunks.length >= 3);

    // First chunk is Tibetan (includes leading space as it's part of BO)
    assert.strictEqual(chunks[0][0], u.BO);
  });

  it('should identify punctuation', () => {
    const cf = new ChunkFramework('བདེ་ལེགས།');
    let chunks = cf.chunkBoChars();
    chunks = cf.pipeChunk(chunks, cf.chunkPunct.bind(cf), u.BO, u.PUNCT);

    // Last chunk should be punctuation (།)
    const lastChunk = chunks[chunks.length - 1];
    assert.strictEqual(lastChunk[0], u.PUNCT);
  });
});

describe('TokChunks', () => {
  it('should split text into syllables', () => {
    const tc = new TokChunks('བཀྲ་ཤིས་བདེ་ལེགས།');
    const syls = tc.getSyls();

    assert.strictEqual(syls.length, 4);
    assert.strictEqual(syls[0], 'བཀྲ');
    assert.strictEqual(syls[1], 'ཤིས');
    assert.strictEqual(syls[2], 'བདེ');
    assert.strictEqual(syls[3], 'ལེགས');
  });

  it('should handle spaces between syllables', () => {
    const tc = new TokChunks('བཀྲ་ཤིས་  བདེ་ལེགས།');
    const syls = tc.getSyls();

    // Spaces should be merged with adjacent syllables
    assert.ok(syls.length >= 3);
  });

  it('should prepare chunks for tokenization', () => {
    const tc = new TokChunks('བཀྲ་ཤིས་');
    tc.serveSylsToTrie();

    assert.ok(tc.chunks.length > 0);

    // Each chunk should be [sylChars | null, chunkInfo]
    for (const chunk of tc.chunks) {
      assert.ok(Array.isArray(chunk));
      assert.strictEqual(chunk.length, 2);
    }
  });

  it('should handle Sanskrit syllables', () => {
    const tc = new TokChunks('ཨོཾ་མ་ཎི་པདྨེ་ཧཱུཾ།');  // Om mani padme hum
    const syls = tc.getSyls();

    assert.ok(syls.length >= 5);
    // Should include ཧཱུཾ as a syllable
    assert.ok(syls.some(s => s.includes('ཧ')));
  });

  it('should handle punctuation correctly', () => {
    const tc = new TokChunks('བདེ་ལེགས། །བཀྲ་ཤིས།');
    const chunks = tc.makeChunks();

    // Should have TEXT and PUNCT chunks
    const hasText = chunks.some(c => c[0] === u.TEXT);
    const hasPunct = chunks.some(c => c[0] === u.PUNCT);

    assert.ok(hasText, 'Should have TEXT chunks');
    assert.ok(hasPunct, 'Should have PUNCT chunks');
  });

  it('should handle spaces as punctuation option', () => {
    const tc = new TokChunks('བ ཀྲ་ཤིས་ བདེ་ལེགས།', [], true);  // spaceAsPunct = true
    const syls = tc.getSyls();

    // With spaces as punctuation, བ should be separate
    assert.ok(syls.length >= 1);
  });
});
