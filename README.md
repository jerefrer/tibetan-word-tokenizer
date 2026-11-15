# tibetan-word-tokenizer

A JavaScript port of [Botok](https://github.com/OpenPecha/Botok), OpenPecha's Tibetan word tokenizer, with Sanskrit detection. It runs in Node.js (18+) with no dependencies.

> This project is a port of Botok, not an original tokenizer. The algorithms and the dictionary come from the OpenPecha / Esukhia team. See [Credits](#credits).

## Installation

```bash
npm install tibetan-word-tokenizer
```

## Usage

```js
import { WordTokenizer } from 'tibetan-word-tokenizer';
import dictionary from 'tibetan-word-tokenizer/data/dictionary.json' with { type: 'json' };

const tokenizer = new WordTokenizer();
tokenizer.loadDictionary(dictionary);

const text = 'བཀྲ་ཤིས་བདེ་ལེགས། ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ།';

console.log(tokenizer.segment(text));
// བཀྲ་ཤིས་ བདེ་ལེགས ། ཨོཾ་ མ་ཎི་ པདྨེ་ ཧཱུྃ །

for (const token of tokenizer.tokenize(text)) {
  console.log(token.text, token.chunkType, token.pos, token.skrt);
}
```

Without a dictionary, `quickTokenize(text)` only splits the text into syllables.

Main API: `WordTokenizer` (`loadDictionary`, `tokenize`, `tokenizeToStrings`, `segment`), `Token`, `Trie`, `TokChunks`, `quickTokenize`, `isSanskrit`, `isSanskritSyllable`, `hasSanskritSyllable`. Each token exposes `text`, `textCleaned`, `chunkType`, `pos`, `lemma`, `senses`, `skrt`, `affixed` and more.

## Sanskrit detection

As in Botok, a syllable is flagged as Sanskrit when it contains Sanskrit-only vowels (long vowels, vocalic r/l), retroflex or aspirated consonants, or consonant clusters that are not valid in Tibetan. Tokens carry the result in `token.skrt`, and the helpers are exported directly:

```js
import { isSanskritSyllable } from 'tibetan-word-tokenizer';
```

The detection is heuristic, as it is in Botok: some Sanskrit syllables (for example `པདྨེ`) are not flagged.

## Relation to Botok

- Ported from the Python library [Botok](https://github.com/OpenPecha/Botok): chunking, the syllable trie, word matching with affixed particles, and Sanskrit syllable detection.
- The dictionary in `data/dictionary.json` is converted from the "general" dialect pack of [botok-data](https://github.com/Esukhia/botok-data). `npm run build-data` regenerates it from a local copy of the pack.
- Not ported: dialect packs other than the one bundled, the adjustment rules and CQL engine, the token-modifying and POS post-processing modules, the file-processing helpers, and the Python configuration and download machinery. Results can therefore differ from Botok's.

## Development

```bash
npm test
```

## Credits

All the linguistic work is by the Botok team at [OpenPecha](https://openpecha.org) (formerly Esukhia): Drupchen, Élie Roux, Ngawang Trinley, Mikko Kotila, Thubten Rinzin, Tenzin and the other contributors listed in the [Botok README](https://github.com/OpenPecha/Botok#acknowledgements), with funding and data curation from the Khyentse Foundation, Barom/Esukhia and BDRC.

The JavaScript port is by [Jérémy Frère](https://frerejeremy.me).

## Licence

Apache License 2.0, the same as Botok. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

The bundled word lists come from botok-data, which does not state a licence of its own; they are redistributed here as part of the Botok ecosystem.
