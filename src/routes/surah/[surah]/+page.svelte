<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { app } from '$lib/app-state.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import InfoPane from '$lib/components/InfoPane.svelte';
	import VerseCard from '$lib/components/VerseCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const chapter = $derived(data.chapters[data.surahData.surah - 1]);
	const prev = $derived(chapter.number > 1 ? data.chapters[chapter.number - 2] : null);
	const next = $derived(chapter.number < 114 ? data.chapters[chapter.number] : null);

	let main: HTMLElement;

	// The reader scrolls inside <main>, not the window, so handle scroll
	// reset / hash anchors ourselves on navigation.
	afterNavigate(({ to }) => {
		const hash = to?.url.hash?.slice(1);
		const target = hash ? document.getElementById(hash) : null;
		if (target) target.scrollIntoView();
		else main.scrollTop = 0;
	});

	// Track the topmost visible verse as reading progress.
	$effect(() => {
		const surah = data.surahData.surah;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- observer bookkeeping only, never rendered
		const visible = new Set<number>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const n = Number((entry.target as HTMLElement).dataset.verse);
					if (entry.isIntersecting) visible.add(n);
					else visible.delete(n);
				}
				if (visible.size) app.setLastRead(surah, Math.min(...visible));
			},
			{ root: main, rootMargin: '0px 0px -40% 0px' }
		);
		for (const node of main.querySelectorAll('[data-verse]')) observer.observe(node);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>{chapter.nameSimple} · Tadabbur</title>
</svelte:head>

<main bind:this={main} class="min-w-0 grow overflow-y-auto">
	<div class="mx-auto max-w-3xl px-6 pb-24 lg:px-10">
		<header class="flex items-start justify-between gap-4 pt-10 pb-6">
			<div>
				<h1 class="text-2xl font-semibold tracking-tight text-stone-900">
					{chapter.nameSimple}
				</h1>
				<p class="mt-1 text-sm text-stone-400">
					{chapter.nameEn} · {chapter.nameId} · {chapter.versesCount} verses ·
					{chapter.revelationPlace === 'makkah' ? 'Makkah' : 'Madinah'}
				</p>
			</div>
			{#if !app.prefs.infoOpen}
				<button
					type="button"
					class="hidden rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 xl:block"
					title="Show info pane"
					aria-label="Show info pane"
					onclick={() => {
						app.prefs.infoOpen = true;
						app.persistPrefs();
					}}
				>
					<Icon name="panel" />
				</button>
			{/if}
		</header>

		{#if chapter.bismillahPre}
			<p
				dir="rtl"
				lang="ar"
				class="font-arabic border-y border-stone-100 py-6 text-center text-3xl text-stone-800"
			>
				بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
			</p>
		{/if}

		{#each data.surahData.verses as verse (verse.key)}
			<VerseCard surah={data.surahData.surah} {verse} />
		{/each}

		<nav class="mt-10 flex items-center justify-between gap-4">
			{#if prev}
				<a
					href={resolve('/surah/[surah]', { surah: String(prev.number) })}
					class="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition-colors hover:border-accent hover:text-accent"
				>
					<Icon name="chevron-left" size={16} />
					{prev.number}. {prev.nameSimple}
				</a>
			{:else}
				<span></span>
			{/if}
			{#if next}
				<a
					href={resolve('/surah/[surah]', { surah: String(next.number) })}
					class="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition-colors hover:border-accent hover:text-accent"
				>
					{next.number}. {next.nameSimple}
					<Icon name="chevron-right" size={16} />
				</a>
			{/if}
		</nav>
	</div>
</main>

{#if app.prefs.infoOpen}
	<InfoPane {chapter} surahData={data.surahData} />
{/if}
