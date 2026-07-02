import { getChapters } from '$lib/quran/data';
import type { LayoutLoad } from './$types';

// Fully client-rendered: every route prerenders to a static shell served
// straight from the CDN, so no Worker runs on the request path. Content
// hydrates client-side from cached JSON (see $lib/content/sync.svelte.ts).
export const ssr = false;
export const prerender = true;

export const load: LayoutLoad = async ({ fetch }) => {
	return { chapters: await getChapters(fetch) };
};
