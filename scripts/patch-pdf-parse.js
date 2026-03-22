// Postinstall script to patch pdf-parse for Next.js compatibility
const fs = require('fs');
const path = require('path');

const pdfParseIndexPath = path.join(__dirname, '..', 'node_modules', 'pdf-parse', 'index.js');

const patchedContent = `const Fs = require('fs');
const Pdf = require('./lib/pdf-parse.js');

module.exports = Pdf;

// Disabled test mode - causes issues in bundled environments (Next.js Turbopack)
// See: https://github.com/mozilla/pdf.js/issues/8963
`;

try {
  fs.writeFileSync(pdfParseIndexPath, patchedContent, 'utf8');
  console.log('✓ Patched pdf-parse/index.js for Next.js compatibility');
} catch (err) {
  console.error('✗ Failed to patch pdf-parse:', err.message);
  process.exit(1);
}
