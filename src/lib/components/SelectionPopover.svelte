<script lang="ts">
	import { player } from '$lib/player.svelte';
	import type { Verse } from '$lib/quran/types';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import Icon from './Icon.svelte';

	let {
		surah,
		verse,
		from,
		to,
		x,
		y
	}: { surah: number; verse: Verse; from: number; to: number; x: number; y: number } = $props();

	const words = $derived(verse.words.slice(from - 1, to));
	const locale = getLocale();
</script>

<div
	class="bg-surface fixed z-50 max-w-md min-w-48 -translate-x-1/2 -translate-y-full rounded-xl border border-edge p-3 shadow-xl"
	style="left: {x}px; top: {y - 10}px"
	role="tooltip"
>
	<div dir="rtl" class="flex flex-wrap justify-center gap-x-3 gap-y-2">
		{#each words as word, i (i)}
			<span class="text-center">
				<span class="font-arabic text-ink block text-xl leading-snug">{word.a}</span>
				<span class="text-faint block max-w-24 text-[11px] leading-tight">
					{locale === 'id' ? word.id : word.en}
				</span>
			</span>
		{/each}
	</div>
	<div class="border-edge-soft mt-2.5 flex items-center justify-between border-t pt-2">
		<span class="text-faint text-[11px] font-medium">{verse.key} · {from}–{to}</span>
		<button
			type="button"
			class="bg-accent-soft text-accent flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80"
			onclick={() => player.play(surah, verse.n, { words: { from, to } })}
		>
			<Icon name="play" size={13} />
			{m.play_selection()}
		</button>
	</div>
</div>
