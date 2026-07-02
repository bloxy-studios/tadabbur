import type { Handle, HandleFetch } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

// On Workers, an SSR fetch to our own origin loops back through the edge
// and Cloudflare kills it (522) — serve same-origin requests from the
// static assets binding instead.
export const handleFetch: HandleFetch = ({ event, request, fetch }) => {
	const assets = event.platform?.env?.ASSETS;
	if (assets && new URL(request.url).origin === event.url.origin) return assets.fetch(request);
	return fetch(request);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = handleParaglide;
