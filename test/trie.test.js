/**
 * Tests for Trie data structure
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Trie } from '../src/trie.js';

describe('Trie', () => {
  it('should add and find words', () => {
    const trie = new Trie();

    trie.add(['བཀྲ', 'ཤིས']);
    trie.add(['བདེ', 'ལེགས']);
    trie.add(['བཀྲ']);

    assert.strictEqual(trie.hasWord(['བཀྲ', 'ཤིས']).exists, true);
    assert.strictEqual(trie.hasWord(['བདེ', 'ལེགས']).exists, true);
    assert.strictEqual(trie.hasWord(['བཀྲ']).exists, true);
    assert.strictEqual(trie.hasWord(['བདེ']).exists, false);
    assert.strictEqual(trie.hasWord(['ཤིས']).exists, false);
  });

  it('should walk the trie step by step', () => {
    const trie = new Trie();
    trie.add(['བཀྲ', 'ཤིས']);

    let node = trie.walk('བཀྲ');
    assert.ok(node);
    assert.strictEqual(node.isMatch(), false);

    node = trie.walk('ཤིས', node);
    assert.ok(node);
    assert.strictEqual(node.isMatch(), true);

    node = trie.walk('བདེ', node);
    assert.strictEqual(node, null);
  });

  it('should store and retrieve data', () => {
    const trie = new Trie();
    trie.add(['བཀྲ', 'ཤིས'], { pos: 'NOUN' });

    const result = trie.hasWord(['བཀྲ', 'ཤིས']);
    assert.strictEqual(result.exists, true);
    assert.strictEqual(result.data.pos, 'NOUN');
  });

  it('should add data to existing words', () => {
    const trie = new Trie();
    trie.add(['བཀྲ', 'ཤིས']);
    trie.addData(['བཀྲ', 'ཤིས'], { pos: 'NOUN', lemma: 'བཀྲ་ཤིས་' });

    const result = trie.hasWord(['བཀྲ', 'ཤིས']);
    assert.strictEqual(result.data.senses[0].pos, 'NOUN');
    assert.strictEqual(result.data.senses[0].lemma, 'བཀྲ་ཤིས་');
  });

  it('should deactivate and reactivate words', () => {
    const trie = new Trie();
    trie.add(['བཀྲ', 'ཤིས']);

    assert.strictEqual(trie.hasWord(['བཀྲ', 'ཤིས']).exists, true);

    trie.deactivate(['བཀྲ', 'ཤིས']);
    assert.strictEqual(trie.hasWord(['བཀྲ', 'ཤིས']).exists, false);

    trie.deactivate(['བཀྲ', 'ཤིས'], true);  // reactivate
    assert.strictEqual(trie.hasWord(['བཀྲ', 'ཤིས']).exists, true);
  });

  it('should serialize and deserialize', () => {
    const trie = new Trie();
    trie.add(['བཀྲ', 'ཤིས'], { pos: 'NOUN' });
    trie.add(['བདེ', 'ལེགས'], { pos: 'NOUN' });

    const json = trie.toJSON();
    const restored = Trie.fromJSON(json);

    assert.strictEqual(restored.hasWord(['བཀྲ', 'ཤིས']).exists, true);
    assert.strictEqual(restored.hasWord(['བཀྲ', 'ཤིས']).data.pos, 'NOUN');
    assert.strictEqual(restored.hasWord(['བདེ', 'ལེགས']).exists, true);
  });

  it('should report correct stats', () => {
    const trie = new Trie();
    trie.add(['བཀྲ', 'ཤིས']);
    trie.add(['བདེ', 'ལེགས']);
    trie.add(['བཀྲ']);  // Shares prefix with first word

    const stats = trie.getStats();
    assert.strictEqual(stats.wordCount, 3);
    // Nodes: root + བཀྲ + ཤིས + བདེ + ལེགས = 5 (བཀྲ is shared)
    assert.strictEqual(stats.nodeCount, 5);
  });
});
