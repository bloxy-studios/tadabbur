import type { Chapter, SurahData, TafsirData, TafsirSlug } from './types';

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

/** Resolved surah values for a synchronous cache-hit path (no skeleton). */
const surahValues = new Map<number, SurahData>();

export function getSurah(fetcher: typeof fetch, surah: number): Promise<SurahData> {
	const promise = getJson<SurahData>(fetcher, `/quran/${surah}.json`);
	promise.then((data) => surahValues.set(surah, data)).catch(() => {});
	return promise;
}

export function getCachedSurah(surah: number): SurahData | undefined {
	return surahValues.get(surah);
}

export function getTafsir(
	fetcher: typeof fetch,
	source: TafsirSlug,
	surah: number
): Promise<TafsirData> {
	return getJson(fetcher, `/tafsir/${source}/${surah}.json`);
}

export function isValidSurah(n: number): boolean {
	return Number.isInteger(n) && n >= 1 && n <= 114;
}
