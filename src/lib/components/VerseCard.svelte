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
	let playMenuOpen = $state(false);

	const isCurrent = $derived(player.current?.surah === surah && player.current.verse === verse.n);
	// The karaoke highlight follows any playback (whole verse or a selected
	// range); the Play/Pause button only reflects whole-verse playback.
	const highlightActive = $derived(player.playing && isCurrent);
	const isPlaying = $derived(highlightActive && !player.rangeActive);
	const activeWord = $derived(highlightActive ? player.currentWord : null);

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
	class="verse-anchor group border-edge-soft border-b py-6 last:border-b-0 {playMenuOpen
		? ''
		: '[content-visibility:auto] [contain-intrinsic-size:auto_190px]'}"
>
	<p
		dir="rtl"
		lang="ar"
		class="font-arabic text-ink leading-loose"
		style="font-size: {app.prefs.arabicSize}rem"
	>
		{#each verse.words as word, i (i)}<span
				data-word={i + 1}
				class="transition-colors duration-100 {activeWord === i + 1 ? 'word-active' : ''}"
				>{word.a}</span
			>
		{/each}<span
			class="text-accent mx-1 inline-block"
			style="font-size: {app.prefs.arabicSize * 0.6}rem">﴿{verse.n}﴾</span
		>
	</p>

	{#if !app.prefs.focusMode}
		<p class="text-body mt-3 text-[15px] leading-relaxed">{verseTranslation(verse)}</p>

		<div
			class="mt-3 flex flex-wrap items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 {tafsirOpen ||
			isPlaying ||
			playMenuOpen
				? 'opacity-100'
				: ''}"
		>
			<span class="bg-edge-soft text-faint mr-1 rounded px-1.5 py-0.5 text-xs font-medium">
				{verse.key}
			</span>
			<div class="relative flex items-center">
				<div
					class="flex items-center rounded-md border transition-colors
						{isPlaying || playMenuOpen ? 'border-accent/50' : 'border-edge'}"
				>
					<button
						type="button"
						class="flex items-center gap-1 rounded-l-[5px] px-2 py-1 text-xs font-medium transition-colors
							{isPlaying ? 'bg-accent-soft text-accent' : 'text-faint hover:bg-edge-soft hover:text-body'}"
						onclick={() => player.toggle(surah, verse.n)}
					>
						<Icon name={isPlaying ? 'pause' : 'play'} size={14} />
						{isPlaying ? m.pause() : m.play()}
					</button>
					<button
						type="button"
						class="flex items-center self-stretch rounded-r-[5px] border-l pr-1 pl-0.5 transition-colors
							{isPlaying || playMenuOpen ? 'border-accent/50' : 'border-edge'}
							{playMenuOpen ? 'bg-accent-soft text-accent' : 'text-faint hover:bg-edge-soft hover:text-body'}"
						title={m.playback_options()}
						aria-label={m.playback_options()}
						aria-expanded={playMenuOpen}
						onclick={() => (playMenuOpen = !playMenuOpen)}
					>
						<Icon name="chevron-down" size={12} />
					</button>
				</div>
				{#if playMenuOpen}
					<button
						type="button"
						class="fixed inset-0 z-20 cursor-default"
						aria-label={m.playback_options()}
						onclick={() => (playMenuOpen = false)}
					></button>
					<div
						class="bg-surface absolute top-full left-0 z-30 mt-1 w-52 rounded-lg border border-edge py-1 shadow-lg"
						role="menu"
					>
						<button
							type="button"
							role="menuitem"
							class="text-body hover:bg-edge-soft flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium"
							onclick={() => {
								playMenuOpen = false;
								void player.play(surah, verse.n);
							}}
						>
							<Icon name="play" size={13} />
							{m.play_this_ayah()}
						</button>
						<button
							type="button"
							role="menuitem"
							class="text-body hover:bg-edge-soft flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium"
							onclick={() => {
								playMenuOpen = false;
								void player.play(surah, verse.n, { continuous: true });
							}}
						>
							<Icon name="chevron-right" size={13} />
							{m.play_from_here()}
						</button>
					</div>
				{/if}
			</div>
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
