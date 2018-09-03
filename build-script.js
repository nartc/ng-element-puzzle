const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/NgPuzzleElement/polyfills.js',
    './dist/NgPuzzleElement/scripts.js',
    './dist/NgPuzzleElement/runtime.js',
    './dist/NgPuzzleElement/main.js',
  ];

  await fs.ensureDir('elements');
  await concat(files, 'elements/word-puzzle.js');
})();
