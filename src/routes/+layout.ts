import { getChapters } from '$lib/quran/data';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	return { chapters: await getChapters(fetch) };
};
