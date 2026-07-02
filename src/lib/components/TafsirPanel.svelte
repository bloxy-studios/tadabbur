<script lang="ts">
	import { app } from '$lib/app-state.svelte';
	import { getTafsir } from '$lib/quran/data';
	import type { TafsirEntry, TranslationLang } from '$lib/quran/types';

	let { surah, verse }: { surah: number; verse: number } = $props();

	const sources: { lang: TranslationLang; label: string }[] = [
		{ lang: 'en', label: 'Ibn Kathir' },
		{ lang: 'id', label: 'Tafsir Kemenag' }
	];

	async function loadEntry(lang: TranslationLang): Promise<TafsirEntry | undefined> {
		const data = await getTafsir(fetch, lang, surah);
		return data.entries.find((e) => verse >= e.from && verse <= e.to);
	}

	const entry = $derived(loadEntry(app.prefs.tafsirLang));
</script>

<div class="mt-3 rounded-xl border border-stone-200 bg-white">
	<div class="flex items-center gap-1 border-b border-stone-100 px-3 py-2">
		{#each sources as source (source.lang)}
			<button
				type="button"
				class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors
					{app.prefs.tafsirLang === source.lang
					? 'bg-accent-soft text-accent'
					: 'text-stone-400 hover:text-stone-600'}"
				onclick={() => {
					app.prefs.tafsirLang = source.lang;
					app.persistPrefs();
				}}
			>
				{source.label}
			</button>
		{/each}
	</div>

	<div class="max-h-96 overflow-y-auto px-4 py-3">
		{#await entry}
			<p class="py-2 text-sm text-stone-400">Loading tafsir…</p>
		{:then found}
			{#if !found}
				<p class="py-2 text-sm text-stone-400">No tafsir available for this verse.</p>
			{:else}
				{#if found.from !== found.to}
					<p class="mb-2 text-xs font-medium text-stone-400">
						Covers verses {found.from}–{found.to}
					</p>
				{/if}
				{#if app.prefs.tafsirLang === 'en'}
					<div class="prose prose-sm prose-stone max-w-none [&_h1]:text-base [&_h2]:text-sm">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted static tafsir content built by our own data script -->
						{@html found.text}
					</div>
				{:else}
					<p class="text-sm leading-relaxed whitespace-pre-line text-stone-600">{found.text}</p>
				{/if}
			{/if}
		{:catch}
			<p class="py-2 text-sm text-red-500">Could not load tafsir. Check your connection.</p>
		{/await}
	</div>
</div>
