import { error } from '@sveltejs/kit';
import { getSurah, isValidSurah } from '$lib/quran/data';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const surah = Number(params.surah);
	if (!isValidSurah(surah)) error(404, 'Surah not found');

	return { surahData: await getSurah(fetch, surah) };
};
