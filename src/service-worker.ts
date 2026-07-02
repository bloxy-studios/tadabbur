/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, prerendered, version } from '$service-worker';
import { CONTENT_CACHE, isContentPath, isPackPath } from '$lib/content/manifest';

const sw = globalThis.self as unknown as ServiceWorkerGlobalScope;

// App shell (JS/CSS, prerendered page shells, fonts) is keyed by deploy
// version and swapped wholesale. Quran/tafsir JSON lives in the separate
// deploy-stable content cache so a redeploy never re-downloads the ~6MB pack.
const APP_CACHE = `app-${version}`;
const shell = [
	...build,
	...files.filter((path) => !isContentPath(path) && !isPackPath(path)),
	...prerendered
];

// `build` is only empty in dev, where SvelteKit still registers the worker —
// stay fully pass-through there and drop any caches a previous session left.
const dev = build.length === 0;

sw.addEventListener('install', (event) => {
	if (dev) return void sw.skipWaiting();
	event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(shell)));
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		Promise.all([
			// Claim the first-install page so it's offline-capable without a
			// reload. Updates are unaffected: a new worker only activates after
			// the old pages are gone, so it never claims a stale page.
			sw.clients.claim(),
			caches
				.keys()
				.then((keys) =>
					Promise.all(
						keys
							.filter((key) => dev || (key !== APP_CACHE && key !== CONTENT_CACHE))
							.map((key) => caches.delete(key))
					)
				)
		])
	);
});

async function cacheFirst(cacheName: string, request: Request | string): Promise<Response> {
	const cache = await caches.open(cacheName);
	const hit = await cache.match(request);
	if (hit) return hit;
	const response = await fetch(request);
	if (response instanceof Response && response.status === 200) {
		await cache.put(request, response.clone());
	}
	return response;
}

sw.addEventListener('fetch', (event) => {
	if (dev || event.request.method !== 'GET') return;
	const url = new URL(event.request.url);
	// Cross-origin (QDC API, audio CDN) and one-shot packs stream normally.
	if (url.origin !== sw.location.origin || isPackPath(url.pathname)) return;

	if (isContentPath(url.pathname)) {
		event.respondWith(cacheFirst(CONTENT_CACHE, event.request));
	} else if (shell.includes(url.pathname)) {
		// Match by pathname so deep links with query strings still hit the shell.
		event.respondWith(cacheFirst(APP_CACHE, url.pathname));
	}
});
