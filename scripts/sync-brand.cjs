// Run after editing brand.json. Static HTML keeps the name available without JavaScript.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const brand = JSON.parse(fs.readFileSync(path.join(root, 'brand.json'), 'utf8'));
if (typeof brand.name !== 'string' || !brand.name.trim()) throw new Error('brand.name must be a non-empty string');
const escapeHTML = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const name = escapeHTML(brand.name.trim());
let changes = 0;
function save(file, output) {
  const target = path.join(root, file);
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (current === output) return;
  changes++;
  if (process.argv.includes('--check')) console.error(`Out of sync: ${file}`);
  else fs.writeFileSync(target, output);
}
for (const file of fs.readdirSync(root).filter((file) => file.endsWith('.html'))) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  html = html.replace(/(<span\b[^>]*\bdata-brand-name[^>]*>)[^<]*(<\/span>)/g, (_, open, close) => open + name + close);
  html = html.replace(/(<title data-brand-template="([^"]+)">)[^<]*(<\/title>)/g,
    (_, open, template, close) => open + template.replaceAll('{brand}', () => name) + close);
  html = html.replace(/<meta data-brand-template="([^"]+)"([^>]*?) content="[^"]*">/g,
    (_, template, attributes) => `<meta data-brand-template="${template}"${attributes} content="${template.replaceAll('{brand}', () => name)}">`);
  html = html.replace(/data-brand-label="([^"]+)" aria-label="[^"]*"/g,
    (_, template) => `data-brand-label="${template}" aria-label="${template.replaceAll('{brand}', () => name)}"`);
  save(file, html);
}
save('brand.js', `// Generated from brand.json by scripts/sync-brand.cjs.\nwindow.SITE_BRAND = Object.freeze(${JSON.stringify({name:brand.name.trim(),status:brand.status})});\n`);
if (process.argv.includes('--check') && changes) process.exitCode = 1;
else console.log(process.argv.includes('--check') ? 'Brand placeholders are in sync.' : `Updated ${changes} files.`);
