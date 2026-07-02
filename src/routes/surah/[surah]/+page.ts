import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { getCachedSurah, getSurah, isValidSurah } from '$lib/quran/data';
import type { EntryGenerator, PageLoad } from './$types';

// With ssr off the prerenderer can't discover links, so list every surah.
export const entries: EntryGenerator = () =>
	Array.from({ length: 114 }, (_, i) => ({ surah: `${i + 1}` }));

export const load: PageLoad = async ({ fetch, params }) => {
	const surah = Number(params.surah);
	if (!isValidSurah(surah)) error(404, 'Surah not found');

	// Already in memory (revisit, preload, or background prefetch): hand the
	// value over synchronously so the reader renders instantly, no skeleton.
	const cached = getCachedSurah(surah);
	if (cached) return { surah, surahData: cached };

	const surahData = getSurah(fetch, surah);
	// Await during SSR so the first HTML ships complete; hand the promise to
	// the page on the client so navigation never blocks on the fetch — the
	// reader shows skeleton verses until it resolves.
	return { surah, surahData: browser ? surahData : await surahData };
};
