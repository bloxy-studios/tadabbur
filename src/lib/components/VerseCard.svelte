<script lang="ts">
	import { app } from '$lib/app-state.svelte';
	import type { Verse } from '$lib/quran/types';
	import Icon from './Icon.svelte';
	import TafsirPanel from './TafsirPanel.svelte';

	let { surah, verse }: { surah: number; verse: Verse } = $props();

	let tafsirOpen = $state(false);
	let copied = $state(false);

	async function copyLink() {
		const url = `${location.origin}/surah/${surah}#v${verse.n}`;
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<article
	id="v{verse.n}"
	data-verse={verse.n}
	class="verse-anchor group border-b border-stone-100 py-6 last:border-b-0"
>
	<p
		dir="rtl"
		lang="ar"
		class="font-arabic leading-loose text-stone-900"
		style="font-size: {app.prefs.arabicSize}rem"
	>
		{verse.arabic}
		<span class="mx-1 inline-block text-accent" style="font-size: {app.prefs.arabicSize * 0.6}rem"
			>﴿{verse.n}﴾</span
		>
	</p>

	{#if app.prefs.showEn}
		<p class="mt-3 text-[15px] leading-relaxed text-stone-700">{verse.en}</p>
	{/if}
	{#if app.prefs.showId}
		<p class="mt-2 text-[15px] leading-relaxed text-stone-500">{verse.id}</p>
	{/if}

	<div
		class="mt-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 {tafsirOpen
			? 'opacity-100'
			: ''}"
	>
		<span class="mr-1 rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-stone-400">
			{verse.key}
		</span>
		<button
			type="button"
			class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors
				{tafsirOpen
				? 'bg-accent-soft text-accent'
				: 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}"
			onclick={() => (tafsirOpen = !tafsirOpen)}
		>
			<Icon name="book" size={14} />
			Tafsir
		</button>
		<button
			type="button"
			class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
			onclick={copyLink}
		>
			<Icon name="link" size={14} />
			{copied ? 'Copied!' : 'Copy link'}
		</button>
	</div>

	{#if tafsirOpen}
		<TafsirPanel {surah} verse={verse.n} />
	{/if}
</article>
