import { dev } from '$app/environment';
import { CONTENT_CACHE } from './manifest';

interface Pack {
	name: string;
	path: string;
	bytes: number;
	files: string[];
}

// Keyed to the cache version so bumping CONTENT_CACHE re-gates everyone.
const INSTALLED_FLAG = `installed:${CONTENT_CACHE}`;

function isInstalled(): boolean {
	try {
		return localStorage.getItem(INSTALLED_FLAG) === '1';
	} catch {
		return true;
	}
}

export const contentSync = $state({
	// Decided synchronously so the first paint already shows the setup screen —
	// waiting for the async cache diff briefly flashed the app underneath.
	installing: !dev && typeof caches !== 'undefined' && !isInstalled(),
	receivedBytes: 0,
	totalBytes: 0,
	// Reflects the install flag for the settings surface; kept in sync by
	// syncContent() (true on success) and clearContent() (false).
	installed: !dev && typeof caches !== 'undefined' ? isInstalled() : false
});

export interface StorageUsage {
	/** Bytes this origin uses on the device, or null if the browser won't say. */
	usage: number | null;
	/** Total quota available to the origin, or null if unknown. */
	quota: number | null;
}

/**
 * Whole-origin storage estimate (not content-cache-specific — the browser
 * only reports per-origin). Good enough for a "how much space Tadabbur uses"
 * readout; returns nulls where the API is unavailable or blocked.
 */
export async function estimateUsage(): Promise<StorageUsage> {
	if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
		return { usage: null, quota: null };
	}
	try {
		const { usage, quota } = await navigator.storage.estimate();
		return { usage: usage ?? null, quota: quota ?? null };
	} catch {
		return { usage: null, quota: null };
	}
}

/**
 * Drops the offline content cache and its install flag, so the next visit (or
 * a manual re-sync) reinstalls from scratch. The app keeps working online —
 * the service worker just falls back to network fetches until refilled.
 */
export async function clearContent(): Promise<void> {
	if (typeof caches === 'undefined') return;
	try {
		await caches.delete(CONTENT_CACHE);
	} finally {
		try {
			localStorage.removeItem(INSTALLED_FLAG);
		} catch {
			// storage blocked — flag was best-effort anyway
		}
		contentSync.installed = false;
		contentSync.receivedBytes = 0;
		contentSync.totalBytes = 0;
	}
}

/**
 * First visit installs the content packs (4 bundled requests, ~6MB gzipped)
 * behind a blocking setup screen with true byte progress; the pack is split
 * into per-file cache entries so the service worker serves them individually.
 * Later visits fill small gaps (e.g. partial cache eviction) silently, or
 * re-install a pack if most of it is gone.
 */
export function syncContent(): Promise<void> {
	if (dev || typeof caches === 'undefined') return Promise.resolve();
	// Dedupe concurrent callers onto one run — the first-visit setup screen and
	// a manual re-sync from settings both target the shared contentSync state,
	// and two overlapping runs would double-count bytes and flip `installing`
	// off (the finally) while the other is still downloading.
	if (!inFlight) {
		inFlight = runSync().finally(() => {
			inFlight = null;
		});
	}
	return inFlight;
}

let inFlight: Promise<void> | null = null;

async function runSync(): Promise<void> {
	try {
		const cache = await caches.open(CONTENT_CACHE);
		const { packs } = (await (await fetch('/pack/manifest.json')).json()) as { packs: Pack[] };
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- cache diff bookkeeping, never rendered
		const cached = new Set((await cache.keys()).map((req) => new URL(req.url).pathname));

		const packsUsable = typeof DecompressionStream !== 'undefined';
		const needed: Pack[] = [];
		const gaps: string[] = [];
		for (const pack of packs) {
			const missing = pack.files.filter((path) => !cached.has(path));
			if (!missing.length) continue;
			if (packsUsable && missing.length > pack.files.length / 4) needed.push(pack);
			else gaps.push(...missing);
		}

		if (needed.length) {
			contentSync.totalBytes = needed.reduce((sum, pack) => sum + pack.bytes, 0);
			contentSync.receivedBytes = 0;
			contentSync.installing = true;
			for (const pack of needed) await installPack(cache, pack);
		}
		await fillGaps(cache, gaps);
		try {
			localStorage.setItem(INSTALLED_FLAG, '1');
		} catch {
			// storage blocked — the flag is only a fast path, the cache diff still works
		}
		contentSync.installed = true;
	} finally {
		contentSync.installing = false;
	}
}

async function installPack(cache: Cache, pack: Pack): Promise<void> {
	const res = await fetch(pack.path);
	if (!res.ok || !res.body) throw new Error(`Pack ${pack.name} failed: ${res.status}`);

	// Packs are gzipped by the build script (not the CDN), so the stream we
	// count here is real network bytes — the progress bar reflects the wire.
	const counted = res.body.pipeThrough(
		new TransformStream<Uint8Array, Uint8Array>({
			transform(chunk, controller) {
				contentSync.receivedBytes += chunk.length;
				controller.enqueue(chunk);
			}
		})
	);
	// Cast: TS types DecompressionStream's writable as BufferSource, which
	// pipeThrough's Uint8Array generics reject despite being runtime-compatible.
	const gunzip = new DecompressionStream('gzip') as unknown as ReadableWritablePair<
		Uint8Array,
		Uint8Array
	>;
	const text = await new Response(counted.pipeThrough(gunzip)).text();

	const { files } = JSON.parse(text) as {
		files: Record<string, unknown>;
	};
	await Promise.all(
		Object.entries(files).map(([path, data]) =>
			cache.put(
				path,
				new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } })
			)
		)
	);
}

async function fillGaps(cache: Cache, gaps: string[]): Promise<void> {
	let next = 0;
	const worker = async () => {
		while (next < gaps.length) {
			const path = gaps[next++];
			try {
				const res = await fetch(path);
				if (res.ok) await cache.put(path, res);
			} catch {
				// offline or flaky — the next visit retries
			}
		}
	};
	await Promise.all(Array.from({ length: 4 }, worker));
}
