import { mkdir, readdir, readFile, rm, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sizes = JSON.parse((await readFile(path.join(root, 'quran-audio-manifest.js'), 'utf8')).split('=')[1].trim().replace(/;$/, ''));
if (sizes.length !== 114) throw new Error('114 sûre bekleniyor.');
for (let n = 1; n <= 114; n++) {
  const file = path.join(root, 'quran-audio', String(n).padStart(3, '0') + '.m4a');
  const bytes = await readFile(file);
  if (bytes.length !== sizes[n - 1] || bytes.toString('ascii', 4, 8) !== 'ftyp') {
    throw new Error(`${n}. sûre eksik veya bozuk.`);
  }
}
const dest = path.join(root, 'www');
await rm(dest, { recursive: true, force: true });
await mkdir(dest);
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && /\.(html|css|js|txt|webmanifest)$/.test(entry.name)) {
    await copyFile(path.join(root, entry.name), path.join(dest, entry.name));
  }
}
for (const dir of ['audio', 'icons', 'mevlid', 'quran-audio']) {
  await mkdir(path.join(dest, dir));
  for (const entry of await readdir(path.join(root, dir), { withFileTypes: true })) {
    if (entry.isFile() && !entry.name.startsWith('.')) {
      await copyFile(path.join(root, dir, entry.name), path.join(dest, dir, entry.name));
    }
  }
}
if ((await stat(path.join(dest, 'mevlid/recitation.mp3'))).size < 1000) throw new Error('Mevlid sesi eksik.');
console.log('114 sûre, Mevlid, salavat sesi ve uygulama dosyaları çevrimdışı pakete alındı.');
