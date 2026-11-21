import { readFile, copyFile, mkdir, rm, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(path.dirname(fileURLToPath(import.meta.url)));
const output = path.resolve(root, 'public');
if (path.dirname(output) !== root || path.basename(output) !== 'public') {
  throw new Error('Invalid hosting output directory');
}
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const js = await readFile(path.join(root, 'script.js'), 'utf8');
const files = new Set(['index.html', 'styles.css', 'script.js']);
for (const match of html.matchAll(/\bsrc="([^"]+)"/g)) {
  if (/^https:\/\//.test(match[1])) continue;
  files.add(match[1]);
}
for (const match of js.matchAll(/\bfile:\s*"([^"]+)"/g)) files.add(match[1]);

// Validate every input before replacing generated output. Never publish source extras.
for (const name of files) {
  if (path.basename(name) !== name || !/^(index\.html|styles\.css|script\.js|[a-zA-Z0-9_. -]+\.(jpg|mp4))$/.test(name)) {
    throw new Error(`Unsupported public asset: ${name}`);
  }
  if (!(await lstat(path.join(root, name))).isFile()) throw new Error(`Not a regular file: ${name}`);
}
try {
  const stat = await lstat(output);
  if (stat.isSymbolicLink() || !stat.isDirectory() || await realpath(output) !== output) {
    throw new Error('Refusing to replace an unsafe public directory');
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const name of files) await copyFile(path.join(root, name), path.join(output, name));
console.log(`Built ${files.size} public files in public/`);
