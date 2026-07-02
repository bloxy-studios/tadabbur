<script lang="ts">
	import { app } from '$lib/app-state.svelte';
	import { player } from '$lib/player.svelte';
	import type { Verse } from '$lib/quran/types';
	import { verseTranslation } from '$lib/quran/locale';
	import { m } from '$lib/paraglide/messages';
	import Icon from './Icon.svelte';
	import TafsirPanel from './TafsirPanel.svelte';

	let { surah, verse }: { surah: number; verse: Verse } = $props();

	let tafsirOpen = $state(false);
	let copied = $state(false);
	let recordNote = $state(false);

	const isPlaying = $derived(
		player.playing && player.current?.surah === surah && player.current.verse === verse.n
	);

	async function copyLink() {
		const url = `${location.origin}/surah/${surah}#v${verse.n}`;
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function record() {
		// Hifz recording is issue #17 — stub until then.
		recordNote = true;
		setTimeout(() => (recordNote = false), 1800);
	}
</script>

<article
	id="v{verse.n}"
	data-verse={verse.n}
	class="verse-anchor group border-edge-soft border-b py-6 [content-visibility:auto] [contain-intrinsic-size:auto_190px] last:border-b-0"
>
	<p
		dir="rtl"
		lang="ar"
		class="font-arabic text-ink leading-loose"
		style="font-size: {app.prefs.arabicSize}rem"
	>
		{verse.arabic}
		<span class="text-accent mx-1 inline-block" style="font-size: {app.prefs.arabicSize * 0.6}rem"
			>﴿{verse.n}﴾</span
		>
	</p>

	{#if !app.prefs.focusMode}
		<p class="text-body mt-3 text-[15px] leading-relaxed">{verseTranslation(verse)}</p>

		<div
			class="mt-3 flex flex-wrap items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 {tafsirOpen ||
			isPlaying
				? 'opacity-100'
				: ''}"
		>
			<span class="bg-edge-soft text-faint mr-1 rounded px-1.5 py-0.5 text-xs font-medium">
				{verse.key}
			</span>
			<button
				type="button"
				class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors
					{isPlaying ? 'bg-accent-soft text-accent' : 'text-faint hover:bg-edge-soft hover:text-body'}"
				onclick={() => player.toggle(surah, verse.n)}
			>
				<Icon name={isPlaying ? 'pause' : 'play'} size={14} />
				{isPlaying ? m.pause() : m.play()}
			</button>
			<button
				type="button"
				class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors
					{tafsirOpen ? 'bg-accent-soft text-accent' : 'text-faint hover:bg-edge-soft hover:text-body'}"
				onclick={() => (tafsirOpen = !tafsirOpen)}
			>
				<Icon name="book" size={14} />
				{m.tafsir()}
			</button>
			<button
				type="button"
				class="text-faint hover:bg-edge-soft hover:text-body flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
				onclick={copyLink}
			>
				<Icon name="link" size={14} />
				{copied ? m.copied() : m.copy_link()}
			</button>
			<button
				type="button"
				class="text-faint hover:bg-edge-soft hover:text-body flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
				onclick={record}
			>
				<Icon name="mic" size={14} />
				{recordNote ? m.coming_soon() : m.record()}
			</button>
		</div>

		{#if tafsirOpen}
			<TafsirPanel {surah} verse={verse.n} />
		{/if}
	{/if}
</article>
