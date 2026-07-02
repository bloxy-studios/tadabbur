<script lang="ts">
	import type { Chapter, SurahData, Verse } from '$lib/quran/types';
	import { getSurah } from '$lib/quran/data';
	import { resolve } from '$app/paths';

	let { chapters }: { chapters: Chapter[] } = $props();

	interface Hit {
		surah: number;
		surahName: string;
		verse: Verse;
	}

	let query = $state('');
	let corpus: SurahData[] | null = $state(null);
	let loading = $state(false);

	async function ensureCorpus() {
		if (corpus || loading) return;
		loading = true;
		try {
			corpus = await Promise.all(chapters.map((c) => getSurah(fetch, c.number)));
		} finally {
			loading = false;
		}
	}

	const hits = $derived.by((): Hit[] => {
		const q = query.trim().toLowerCase();
		if (q.length < 3 || !corpus) return [];
		const out: Hit[] = [];
		for (const surah of corpus) {
			for (const verse of surah.verses) {
				if (
					verse.en.toLowerCase().includes(q) ||
					verse.id.toLowerCase().includes(q) ||
					verse.arabic.includes(q)
				) {
					out.push({
						surah: surah.surah,
						surahName: chapters[surah.surah - 1].nameSimple,
						verse
					});
					if (out.length >= 50) return out;
				}
			}
		}
		return out;
	});
</script>

<div class="flex h-full flex-col">
	<div class="px-3 pb-2">
		<input
			type="search"
			bind:value={query}
			onfocus={ensureCorpus}
			placeholder="Search verses (EN, ID, Arabic)…"
			class="w-full rounded-lg border-stone-200 bg-white px-3 py-1.5 text-sm placeholder:text-stone-400 focus:border-accent focus:ring-accent"
		/>
		<p class="mt-1.5 px-1 text-xs text-stone-400">
			{#if loading}
				Downloading Quran text for offline search…
			{:else if query.trim().length > 0 && query.trim().length < 3}
				Type at least 3 characters
			{:else if query.trim().length >= 3}
				{hits.length}{hits.length === 50 ? '+' : ''} result{hits.length === 1 ? '' : 's'}
			{:else}
				Searches translations and Arabic text, fully on-device
			{/if}
		</p>
	</div>

	<ul class="grow overflow-y-auto px-2 pb-4">
		{#each hits as hit (hit.verse.key)}
			<li>
				<a
					href="{resolve('/surah/[surah]', { surah: String(hit.surah) })}#v{hit.verse.n}"
					class="block rounded-lg px-2 py-2 hover:bg-stone-100"
				>
					<span class="block text-xs font-semibold text-accent"
						>{hit.surahName} {hit.verse.key}</span
					>
					<span class="mt-0.5 line-clamp-2 block text-sm text-stone-600">{hit.verse.en}</span>
					<span class="mt-0.5 line-clamp-2 block text-xs text-stone-400">{hit.verse.id}</span>
				</a>
			</li>
		{/each}
	</ul>
</div>
