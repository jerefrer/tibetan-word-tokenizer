#!/usr/bin/env node

/**
 * Build dictionary JSON from Botok TSV files
 *
 * Usage: node scripts/build-dictionary.js [path-to-dialect-pack]
 *
 * Default path: ~/Documents/pybo/dialect_packs/general
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const DEFAULT_PACK_PATH = join(homedir(), 'Documents', 'pybo', 'dialect_packs', 'general');

function parseTSV(content) {
  const lines = content.split('\n');
  const entries = [];

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.startsWith('#') || line.startsWith('\ufeff#')) {
      continue;
    }

    const parts = line.split('\t');
    const word = parts[0]?.trim();

    if (!word) continue;

    const entry = { word };

    if (parts[1]?.trim()) entry.pos = parts[1].trim();
    if (parts[2]?.trim()) entry.lemma = parts[2].trim();
    if (parts[3]?.trim()) entry.sense = parts[3].trim();
    if (parts[4]?.trim()) {
      const freq = parseInt(parts[4].trim(), 10);
      if (!isNaN(freq)) entry.freq = freq;
    }

    entries.push(entry);
  }

  return entries;
}

function loadTSVFiles(dirPath) {
  const entries = [];

  if (!existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return entries;
  }

  const files = readdirSync(dirPath).filter(f => f.endsWith('.tsv'));

  for (const file of files) {
    const filePath = join(dirPath, file);
    console.log(`  Loading: ${file}`);

    try {
      const content = readFileSync(filePath, 'utf-8');
      const fileEntries = parseTSV(content);
      entries.push(...fileEntries);
      console.log(`    Found ${fileEntries.length} entries`);
    } catch (err) {
      console.error(`  Error loading ${file}:`, err.message);
    }
  }

  return entries;
}

function main() {
  const packPath = process.argv[2] || DEFAULT_PACK_PATH;
  console.log(`Building dictionary from: ${packPath}\n`);

  if (!existsSync(packPath)) {
    console.error(`Error: Dialect pack not found at ${packPath}`);
    console.error('\nTo download the dialect pack, run:');
    console.error('  pip install botok');
    console.error('  python -c "from botok import WordTokenizer; WordTokenizer()"');
    process.exit(1);
  }

  const dictionary = {
    version: '1.0.0',
    source: 'botok-general',
    words: [],
    particles: [],
  };

  // Load main word files
  console.log('Loading words...');
  const wordsPath = join(packPath, 'dictionary', 'words');
  dictionary.words = loadTSVFiles(wordsPath);

  // Load non-inflected words (particles)
  console.log('\nLoading particles...');
  const particlesPath = join(packPath, 'dictionary', 'words_non_inflected');
  dictionary.particles = loadTSVFiles(particlesPath);

  // Merge particles into words
  dictionary.words.push(...dictionary.particles);

  // Deduplicate by word
  const seen = new Set();
  dictionary.words = dictionary.words.filter(entry => {
    const key = entry.word;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  console.log(`\nTotal unique entries: ${dictionary.words.length}`);

  // Write output
  const dataDir = resolve(PROJECT_ROOT, 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  const outputPath = join(dataDir, 'dictionary.json');

  // Write minified version
  writeFileSync(outputPath, JSON.stringify(dictionary));
  console.log(`\nWritten to: ${outputPath}`);

  // Also write pretty version for debugging
  const prettyPath = join(dataDir, 'dictionary.pretty.json');
  writeFileSync(prettyPath, JSON.stringify(dictionary, null, 2));
  console.log(`Pretty version: ${prettyPath}`);

  // Print file sizes
  const stats = {
    minified: readFileSync(outputPath).length,
    pretty: readFileSync(prettyPath).length,
  };
  console.log(`\nFile sizes:`);
  console.log(`  Minified: ${(stats.minified / 1024).toFixed(1)} KB`);
  console.log(`  Pretty: ${(stats.pretty / 1024).toFixed(1)} KB`);
}

main();
