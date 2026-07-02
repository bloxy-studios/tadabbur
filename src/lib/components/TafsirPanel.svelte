<script lang="ts">
	import { getTafsir } from '$lib/quran/data';
	import type { TafsirEntry, TafsirSlug } from '$lib/quran/types';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	let { surah, verse }: { surah: number; verse: number } = $props();

	interface Source {
		slug: TafsirSlug;
		label: string;
		/** Ibn Kathir ships as HTML; the Indonesian tafsirs are plain text. */
		html: boolean;
	}

	// English readers get Ibn Kathir; Indonesian readers get Tafsir Kemenag and
	// Al-Mukhtasar, plus Ibn Kathir (in English) as an extra source — no
	// properly-licensed Indonesian Ibn Kathir exists.
	const sources: Source[] =
		getLocale() === 'id'
			? [
					{ slug: 'kemenag', label: 'Tafsir Kemenag', html: false },
					{ slug: 'mukhtasar', label: 'Al-Mukhtasar', html: false },
					{ slug: 'ibn-kathir', label: 'Ibn Kathir (EN)', html: true }
				]
			: [{ slug: 'ibn-kathir', label: 'Ibn Kathir', html: true }];

	let selected: Source = $state(sources[0]);

	async function loadEntry(slug: TafsirSlug): Promise<TafsirEntry | undefined> {
		const data = await getTafsir(fetch, slug, surah);
		return data.entries.find((e) => verse >= e.from && verse <= e.to);
	}

	const entry = $derived(loadEntry(selected.slug));
</script>

<div class="bg-surface mt-3 rounded-xl border border-edge">
	{#if sources.length > 1}
		<div class="border-edge-soft flex items-center gap-1 border-b px-3 py-2">
			{#each sources as source (source.slug)}
				<button
					type="button"
					class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors
						{selected.slug === source.slug ? 'bg-accent-soft text-accent' : 'text-faint hover:text-body'}"
					onclick={() => (selected = source)}
				>
					{source.label}
				</button>
			{/each}
		</div>
	{:else}
		<div class="border-edge-soft border-b px-4 py-2">
			<span class="text-faint text-xs font-semibold">{sources[0].label}</span>
		</div>
	{/if}

	<div class="max-h-96 overflow-y-auto px-4 py-3">
		{#await entry}
			<p class="text-faint py-2 text-sm">{m.tafsir_loading()}</p>
		{:then found}
			{#if !found}
				<p class="text-faint py-2 text-sm">{m.tafsir_none()}</p>
			{:else}
				{#if found.from !== found.to}
					<p class="text-faint mb-2 text-xs font-medium">
						{m.tafsir_covers({ from: found.from, to: found.to })}
					</p>
				{/if}
				{#if selected.html}
					<div
						class="prose prose-sm prose-stone dark:prose-invert max-w-none [&_h1]:text-base [&_h2]:text-sm"
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted static tafsir content built by our own data script -->
						{@html found.text}
					</div>
				{:else}
					<p class="text-body text-sm leading-relaxed whitespace-pre-line">{found.text}</p>
				{/if}
			{/if}
		{:catch}
			<p class="py-2 text-sm text-red-500">{m.tafsir_error()}</p>
		{/await}
	</div>
</div>
