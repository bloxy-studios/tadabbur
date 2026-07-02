/**
 * Bundles the per-surah JSON in static/ into one pack file per source so the
 * first-run install is 4 requests instead of 457. Runs before vite build;
 * output lands in static/pack/ (gitignored). The manifest carries exact byte
 * sizes so the installer can show true progress while streaming.
 */

import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = new URL('..', import.meta.url).pathname;

const packs = [
	{ name: 'quran', dir: 'static/quran', prefix: '/quran/' },
	{ name: 'ibn-kathir', dir: 'static/tafsir/ibn-kathir', prefix: '/tafsir/ibn-kathir/' },
	{ name: 'kemenag', dir: 'static/tafsir/kemenag', prefix: '/tafsir/kemenag/' },
	{ name: 'mukhtasar', dir: 'static/tafsir/mukhtasar', prefix: '/tafsir/mukhtasar/' }
];

await rm(join(root, 'static/pack'), { recursive: true, force: true });
await mkdir(join(root, 'static/pack'), { recursive: true });

const manifest = [];
for (const pack of packs) {
	const names = (await readdir(join(root, pack.dir))).filter((f) => f.endsWith('.json')).sort();
	const parts = [];
	const files = [];
	for (const name of names) {
		const raw = (await readFile(join(root, pack.dir, name), 'utf8')).trim();
		const path = pack.prefix + name;
		files.push(path);
		parts.push(`${JSON.stringify(path)}:${raw}`);
	}
	const body = gzipSync(`{"files":{${parts.join(',')}}}`, { level: 9 });
	await writeFile(join(root, 'static/pack', `${pack.name}.json.gz`), body);
	manifest.push({
		name: pack.name,
		path: `/pack/${pack.name}.json.gz`,
		bytes: body.byteLength,
		files
	});
	console.log(
		`pack/${pack.name}.json.gz — ${files.length} files, ${(body.byteLength / 1e6).toFixed(1)} MB gzipped`
	);
}

await writeFile(join(root, 'static/pack/manifest.json'), JSON.stringify({ packs: manifest }));
console.log('pack/manifest.json written');
