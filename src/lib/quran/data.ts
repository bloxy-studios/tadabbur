import type { Chapter, SurahData, TafsirData, TranslationLang } from './types';

/**
 * All Quran content is served as static JSON from /quran and /tafsir.
 * An in-memory cache on top of the browser's HTTP cache makes repeat
 * navigation instant without refetching or reparsing.
 */
const cache = new Map<string, Promise<unknown>>();

function getJson<T>(fetcher: typeof fetch, path: string): Promise<T> {
	let hit = cache.get(path);
	if (!hit) {
		hit = fetcher(path).then((res) => {
			if (!res.ok) {
				cache.delete(path);
				throw new Error(`Failed to load ${path}: ${res.status}`);
			}
			return res.json();
		});
		cache.set(path, hit);
	}
	return hit as Promise<T>;
}

export function getChapters(fetcher: typeof fetch): Promise<Chapter[]> {
	return getJson(fetcher, '/quran/chapters.json');
}

export function getSurah(fetcher: typeof fetch, surah: number): Promise<SurahData> {
	return getJson(fetcher, `/quran/${surah}.json`);
}

export function getTafsir(
	fetcher: typeof fetch,
	lang: TranslationLang,
	surah: number
): Promise<TafsirData> {
	return getJson(fetcher, `/tafsir/${lang}/${surah}.json`);
}

export function isValidSurah(n: number): boolean {
	return Number.isInteger(n) && n >= 1 && n <= 114;
}
