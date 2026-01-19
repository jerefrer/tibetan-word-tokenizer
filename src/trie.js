/**
 * Trie data structure for Tibetan word lookup
 * Ported from Botok's basictrie.py and trie.py
 */

/**
 * Node in the Trie
 */
class TrieNode {
  constructor(label = null, leaf = false) {
    this.label = label;
    this.leaf = leaf;
    this.data = { _: {} };  // Stores word metadata
    this.children = new Map();
  }

  addChild(key, leaf = false) {
    if (!this.children.has(key)) {
      this.children.set(key, new TrieNode(key, leaf));
    }
    return this.children.get(key);
  }

  canWalk() {
    return this.children.size > 0;
  }

  isMatch() {
    return this.leaf;
  }
}

/**
 * Trie for efficient word lookup
 * Words are stored as sequences of syllables
 */
export class Trie {
  constructor() {
    this.head = new TrieNode();
  }

  /**
   * Add a word to the trie
   * @param {string[]} syllables - Array of syllables forming the word
   * @param {Object} data - Optional metadata for the word
   */
  add(syllables, data = null) {
    let currentNode = this.head;

    for (const syl of syllables) {
      if (currentNode.children.has(syl)) {
        currentNode = currentNode.children.get(syl);
      } else {
        currentNode = currentNode.addChild(syl);
      }
    }

    currentNode.leaf = true;

    if (data) {
      Object.assign(currentNode.data, data);
    }
  }

  /**
   * Walk the trie one syllable at a time
   * @param {string} syllable - Current syllable
   * @param {TrieNode} currentNode - Current position in trie (null = start)
   * @returns {TrieNode|null} Next node or null if no match
   */
  walk(syllable, currentNode = null) {
    if (!currentNode) {
      currentNode = this.head;
    }

    if (currentNode.children.has(syllable)) {
      return currentNode.children.get(syllable);
    }

    return null;
  }

  /**
   * Check if a word exists in the trie
   * @param {string[]} syllables - Array of syllables
   * @returns {Object} { exists: boolean, data: Object }
   */
  hasWord(syllables) {
    if (!syllables || syllables.length === 0) {
      return { exists: false, data: {} };
    }

    let currentNode = this.head;

    for (const syl of syllables) {
      if (currentNode.children.has(syl)) {
        currentNode = currentNode.children.get(syl);
      } else {
        return { exists: false, data: currentNode.data };
      }
    }

    return {
      exists: currentNode.leaf,
      data: currentNode.data
    };
  }

  /**
   * Add metadata to an existing word
   * @param {string[]} syllables - Array of syllables
   * @param {Object} data - Metadata to add
   * @returns {boolean} True if word exists and data was added
   */
  addData(syllables, data) {
    if (!syllables || syllables.length === 0) {
      return false;
    }

    let currentNode = this.head;

    for (const syl of syllables) {
      if (currentNode.children.has(syl)) {
        currentNode = currentNode.children.get(syl);
      } else {
        return false;
      }
    }

    if (!currentNode.leaf) {
      return false;
    }

    // Add senses (meanings/POS)
    if (!currentNode.data.senses) {
      currentNode.data.senses = [];
    }

    // Add meaning if different from existing
    const isDifferent = this._isDifferentMeaning(currentNode.data.senses, data);
    if (isDifferent) {
      currentNode.data.senses.push(data);
    }

    return true;
  }

  /**
   * Check if a meaning is different from existing ones
   * @private
   */
  _isDifferentMeaning(senses, newMeaning) {
    for (const existing of senses) {
      let same = true;
      for (const [key, value] of Object.entries(newMeaning)) {
        if (existing[key] !== value) {
          same = false;
          break;
        }
      }
      if (same) {
        return false;
      }
    }
    return true;
  }

  /**
   * Deactivate a word (make it not findable)
   * @param {string[]} syllables - Array of syllables
   * @param {boolean} reactivate - If true, reactivate instead
   * @returns {boolean} True if word exists
   */
  deactivate(syllables, reactivate = false) {
    let currentNode = this.head;

    for (const syl of syllables) {
      if (currentNode.children.has(syl)) {
        currentNode = currentNode.children.get(syl);
      } else {
        return false;
      }
    }

    currentNode.leaf = reactivate;
    return true;
  }

  /**
   * Get statistics about the trie
   * @returns {Object} { wordCount, nodeCount }
   */
  getStats() {
    let wordCount = 0;
    let nodeCount = 0;

    const traverse = (node) => {
      nodeCount++;
      if (node.leaf) {
        wordCount++;
      }
      for (const child of node.children.values()) {
        traverse(child);
      }
    };

    traverse(this.head);

    return { wordCount, nodeCount };
  }

  /**
   * Serialize trie to JSON
   * @returns {Object} Serialized trie
   */
  toJSON() {
    const serializeNode = (node) => {
      const obj = {
        leaf: node.leaf,
        data: node.data,
      };

      if (node.children.size > 0) {
        obj.children = {};
        for (const [key, child] of node.children) {
          obj.children[key] = serializeNode(child);
        }
      }

      return obj;
    };

    return serializeNode(this.head);
  }

  /**
   * Deserialize trie from JSON
   * @param {Object} json - Serialized trie
   * @returns {Trie}
   */
  static fromJSON(json) {
    const trie = new Trie();

    const deserializeNode = (obj, node) => {
      node.leaf = obj.leaf;
      node.data = obj.data || { _: {} };

      if (obj.children) {
        for (const [key, childObj] of Object.entries(obj.children)) {
          const childNode = new TrieNode(key);
          node.children.set(key, childNode);
          deserializeNode(childObj, childNode);
        }
      }
    };

    deserializeNode(json, trie.head);

    return trie;
  }
}

export { TrieNode };
