/**
 * Post-build SEO pass. With ssr=false the prerendered shells carry no
 * per-page head at all, so crawlers would see 117 identical untitled pages.
 * This injects a unique title/description/canonical/OG block into each
 * prerendered HTML file and writes sitemap.xml. Runtime titles still come
 * from svelte:head (document.title wins over the static tag for users).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SITE = 'https://tadabbur.fahreziadh.workers.dev';
const root = new URL('..', import.meta.url).pathname;
const out = join(root, '.svelte-kit/cloudflare');

interface Chapter {
	number: number;
	nameArabic: string;
	nameSimple: string;
	nameEn: string;
	versesCount: number;
	revelationPlace: string;
}

const chapters: Chapter[] = JSON.parse(
	await readFile(join(root, 'static/quran/chapters.json'), 'utf8')
);

const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

function headBlock(path: string, title: string, description: string, noindex = false): string {
	return [
		`<title>${esc(title)}</title>`,
		`<meta name="description" content="${esc(description)}" />`,
		`<link rel="canonical" href="${SITE}${path}" />`,
		`<meta property="og:title" content="${esc(title)}" />`,
		`<meta property="og:description" content="${esc(description)}" />`,
		`<meta property="og:url" content="${SITE}${path}" />`,
		noindex ? '<meta name="robots" content="noindex" />' : ''
	].join('\n\t\t');
}

const tagline = 'A calm, offline-first Quran reader for deep reflection.';
const pages: {
	file: string;
	path: string;
	title: string;
	description: string;
	noindex?: boolean;
}[] = [
	{
		file: 'index.html',
		path: '/',
		title: 'Tadabbur — Quran reader for deep reflection',
		description: `${tagline} Word-by-word translation, recitation follow-along, and three tafsirs — the whole Quran works offline.`
	},
	{
		file: 'about.html',
		path: '/about',
		title: 'About · Tadabbur',
		description:
			'What Tadabbur means, what the app can do, and where its Quran text, translations, tafsir, and audio come from.'
	},
	{
		file: 'roadmap.html',
		path: '/roadmap',
		title: 'Roadmap · Tadabbur',
		description:
			'What has shipped in Tadabbur and what is coming next: notes, sync, hifz recording, and more.'
	},
	{
		file: 'progress.html',
		path: '/progress',
		title: 'Progress · Tadabbur',
		description: 'Your reading progress.',
		noindex: true
	},
	{
		file: 'settings.html',
		path: '/settings',
		title: 'Settings · Tadabbur',
		description: 'App settings.',
		noindex: true
	},
	...chapters.map((ch) => ({
		file: `surah/${ch.number}.html`,
		path: `/surah/${ch.number}`,
		title: `${ch.nameSimple} (${ch.nameArabic}) · Surah ${ch.number} — Tadabbur`,
		description: `Read Surah ${ch.nameSimple} (${ch.nameEn}) — ${ch.versesCount} verses, revealed in ${ch.revelationPlace === 'makkah' ? 'Makkah' : 'Madinah'}. Word-by-word translation, recitation follow-along, and tafsir, fully offline.`
	}))
];

const jsonLd = `<script type="application/ld+json">${JSON.stringify({
	'@context': 'https://schema.org',
	'@type': 'WebApplication',
	name: 'Tadabbur',
	url: SITE,
	description: tagline,
	applicationCategory: 'ReferenceApplication',
	operatingSystem: 'Any',
	offers: { '@type': 'Offer', price: '0' }
})}</script>`;

for (const page of pages) {
	const file = join(out, page.file);
	let html = await readFile(file, 'utf8');
	let block = headBlock(page.path, page.title, page.description, page.noindex);
	if (page.file === 'index.html') block += `\n\t\t${jsonLd}`;
	html = html.replace('</head>', `\t${block}\n\t</head>`);
	await writeFile(file, html);
}

const urls = pages
	.filter((page) => !page.noindex)
	.map((page) => `\t<url><loc>${SITE}${page.path}</loc></url>`)
	.join('\n');
await writeFile(
	join(out, 'sitemap.xml'),
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

console.log(`seo: ${pages.length} pages tagged, sitemap.xml written (${pages.length - 2} urls)`);
