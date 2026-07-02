<script lang="ts">
	import { app } from '$lib/app-state.svelte';
	import type { Chapter, SurahData } from '$lib/quran/types';
	import { chapterName } from '$lib/quran/locale';
	import { m } from '$lib/paraglide/messages';
	import Icon from './Icon.svelte';

	let { chapter, surahData }: { chapter: Chapter; surahData: SurahData } = $props();

	const juzFrom = $derived(surahData.verses[0]?.juz);
	const juzTo = $derived(surahData.verses[surahData.verses.length - 1]?.juz);

	const rows = $derived([
		{ label: m.info_number(), value: m.info_number_value({ n: chapter.number }) },
		{
			label: m.info_revealed_in(),
			value: chapter.revelationPlace === 'makkah' ? m.makkah() : m.madinah()
		},
		{ label: m.info_order(), value: `${chapter.revelationOrder}` },
		{ label: m.info_verses(), value: `${chapter.versesCount}` },
		{ label: m.info_juz(), value: juzFrom === juzTo ? `${juzFrom}` : `${juzFrom}–${juzTo}` },
		{
			label: m.info_pages(),
			value:
				chapter.pages[0] === chapter.pages[1]
					? `${chapter.pages[0]}`
					: `${chapter.pages[0]}–${chapter.pages[1]}`
		}
	]);
</script>

<aside class="bg-paper hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-edge xl:flex">
	<div class="flex items-center justify-between px-4 pt-4 pb-2">
		<h2 class="text-faint text-xs font-semibold tracking-widest uppercase">{m.info()}</h2>
		<button
			type="button"
			class="text-faint hover:bg-edge-soft hover:text-body rounded p-1"
			title={m.hide_info()}
			aria-label={m.hide_info()}
			onclick={() => {
				app.prefs.infoOpen = false;
				app.persistPrefs();
			}}
		>
			<Icon name="close" size={16} />
		</button>
	</div>

	<div class="px-4">
		<p class="font-arabic text-ink py-3 text-center text-4xl">{chapter.nameArabic}</p>
		<p class="text-body text-center text-sm font-medium">{chapter.nameSimple}</p>
		<p class="text-faint text-center text-xs">{chapterName(chapter)}</p>
	</div>

	<dl class="mt-5 px-4">
		{#each rows as row (row.label)}
			<div class="border-edge-soft flex items-center justify-between border-b py-2 text-sm">
				<dt class="text-faint">{row.label}</dt>
				<dd class="text-body font-medium">{row.value}</dd>
			</div>
		{/each}
	</dl>

	<div class="px-4 py-4">
		<p class="text-faint text-xs leading-relaxed">
			{chapter.bismillahPre ? m.info_bismillah_yes() : m.info_bismillah_no()}
			{m.info_sources()}
		</p>
	</div>
</aside>
