<script lang="ts">
	import type { Chapter, SurahData, Verse } from '$lib/quran/types';
	import { app } from '$lib/app-state.svelte';
	import { getSurah } from '$lib/quran/data';
	import { verseTranslation } from '$lib/quran/locale';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';

	let { chapters }: { chapters: Chapter[] } = $props();

	interface Hit {
		surah: number;
		surahName: string;
		verse: Verse;
	}

	let query = $state('');
	let corpus: SurahData[] | null = $state(null);
	let loading = $state(false);
	let input: HTMLInputElement | undefined = $state();

	// Focus on mount and whenever Cmd/Ctrl+F is pressed again.
	$effect(() => {
		void app.searchFocusTick;
		input?.focus();
		input?.select();
	});

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
				if (verseTranslation(verse).toLowerCase().includes(q) || verse.arabic.includes(q)) {
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

<div class="flex min-h-0 grow flex-col">
	<div class="px-3 pb-2">
		<input
			type="search"
			bind:this={input}
			bind:value={query}
			onfocus={ensureCorpus}
			placeholder={m.search_placeholder()}
			class="bg-surface placeholder:text-faint focus:border-accent focus:ring-accent w-full rounded-lg border-edge px-3 py-1.5 text-sm"
		/>
		<p class="text-faint mt-1.5 px-1 text-xs">
			{#if loading}
				{m.search_downloading()}
			{:else if query.trim().length > 0 && query.trim().length < 3}
				{m.search_min_chars()}
			{:else if query.trim().length >= 3}
				{m.search_results({ count: `${hits.length}${hits.length === 50 ? '+' : ''}` })}
			{:else}
				{m.search_hint()}
			{/if}
		</p>
	</div>

	<ul class="grow overflow-y-auto px-2 pb-4">
		{#each hits as hit (hit.verse.key)}
			<li>
				<a
					href="{resolve('/surah/[surah]', { surah: String(hit.surah) })}#v{hit.verse.n}"
					class="hover:bg-edge-soft block rounded-lg px-2 py-2"
				>
					<span class="text-accent block text-xs font-semibold">
						{hit.surahName}
						{hit.verse.key}
					</span>
					<span class="text-body mt-0.5 line-clamp-3 block text-sm">
						{verseTranslation(hit.verse)}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</div>
