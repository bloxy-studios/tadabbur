<script lang="ts">
	import { app } from '$lib/app-state.svelte';
	import type { Chapter, SurahData } from '$lib/quran/types';
	import Icon from './Icon.svelte';

	let { chapter, surahData }: { chapter: Chapter; surahData: SurahData } = $props();

	const juzFrom = $derived(surahData.verses[0]?.juz);
	const juzTo = $derived(surahData.verses[surahData.verses.length - 1]?.juz);

	const rows = $derived([
		{ label: 'Number', value: `${chapter.number} of 114` },
		{
			label: 'Revealed in',
			value: chapter.revelationPlace === 'makkah' ? 'Makkah' : 'Madinah'
		},
		{ label: 'Revelation order', value: `${chapter.revelationOrder}` },
		{ label: 'Verses', value: `${chapter.versesCount}` },
		{ label: 'Juz', value: juzFrom === juzTo ? `${juzFrom}` : `${juzFrom}–${juzTo}` },
		{
			label: 'Mushaf pages',
			value:
				chapter.pages[0] === chapter.pages[1]
					? `${chapter.pages[0]}`
					: `${chapter.pages[0]}–${chapter.pages[1]}`
		}
	]);
</script>

<aside
	class="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-stone-200 bg-paper xl:flex"
>
	<div class="flex items-center justify-between px-4 pt-4 pb-2">
		<h2 class="text-xs font-semibold tracking-widest text-stone-400 uppercase">Info</h2>
		<button
			type="button"
			class="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
			title="Hide info pane"
			aria-label="Hide info pane"
			onclick={() => {
				app.prefs.infoOpen = false;
				app.persistPrefs();
			}}
		>
			<Icon name="close" size={16} />
		</button>
	</div>

	<div class="px-4">
		<p class="font-arabic py-3 text-center text-4xl text-stone-800">{chapter.nameArabic}</p>
		<p class="text-center text-sm font-medium text-stone-700">{chapter.nameSimple}</p>
		<p class="text-center text-xs text-stone-400">{chapter.nameEn} · {chapter.nameId}</p>
	</div>

	<dl class="mt-5 px-4">
		{#each rows as row (row.label)}
			<div class="flex items-center justify-between border-b border-stone-100 py-2 text-sm">
				<dt class="text-stone-400">{row.label}</dt>
				<dd class="font-medium text-stone-700">{row.value}</dd>
			</div>
		{/each}
	</dl>

	<div class="px-4 py-4">
		<p class="text-xs leading-relaxed text-stone-400">
			{chapter.bismillahPre
				? 'This surah opens with Bismillah.'
				: 'This surah does not open with Bismillah.'}
			Text: Uthmani script. Translations: Saheeh International (EN), Kemenag (ID).
		</p>
	</div>
</aside>
