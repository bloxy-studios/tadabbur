import { error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { getSurah, isValidSurah } from '$lib/quran/data';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const surah = Number(params.surah);
	if (!isValidSurah(surah)) error(404, 'Surah not found');

	const surahData = getSurah(fetch, surah);
	// Await during SSR so the first HTML ships complete; hand the promise to
	// the page on the client so navigation never blocks on the fetch — the
	// reader shows skeleton verses until it resolves.
	return { surah, surahData: browser ? surahData : await surahData };
};
