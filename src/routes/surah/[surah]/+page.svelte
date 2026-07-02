<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { app } from '$lib/app-state.svelte';
	import { chapterName } from '$lib/quran/locale';
	import type { SurahData } from '$lib/quran/types';
	import { m } from '$lib/paraglide/messages';
	import Icon from '$lib/components/Icon.svelte';
	import InfoPane from '$lib/components/InfoPane.svelte';
	import VerseCard from '$lib/components/VerseCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const chapter = $derived(data.chapters[data.surah - 1]);
	const prev = $derived(chapter.number > 1 ? data.chapters[chapter.number - 2] : null);
	const next = $derived(chapter.number < 114 ? data.chapters[chapter.number] : null);

	const skeletonRows = Array.from({ length: 6 }, (_, i) => i);

	// On the server the load awaited the data; on client navigation it hands
	// us a promise so the page renders immediately with skeleton verses.
	let resolved = $state<SurahData | null>(null);
	const surahData = $derived(
		data.surahData instanceof Promise
			? resolved?.surah === data.surah
				? resolved
				: null
			: data.surahData
	);

	$effect(() => {
		const incoming = data.surahData;
		if (!(incoming instanceof Promise)) return;
		let cancelled = false;
		incoming.then((surah) => {
			if (!cancelled) resolved = surah;
		});
		return () => {
			cancelled = true;
		};
	});

	let main: HTMLElement;

	// The reader scrolls inside <main>, not the window, so handle scroll
	// reset / hash anchors ourselves on navigation.
	afterNavigate(({ to }) => {
		const hash = to?.url.hash?.slice(1);
		const target = hash ? document.getElementById(hash) : null;
		if (target) target.scrollIntoView();
		else main.scrollTop = 0;
	});

	// Once verses are in the DOM: honor a hash anchor that couldn't resolve
	// during the skeleton, and track the topmost visible verse as progress.
	$effect(() => {
		if (!surahData) return;
		const surah = surahData.surah;

		const hash = location.hash.slice(1);
		const target = hash ? document.getElementById(hash) : null;
		if (target) target.scrollIntoView();

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

	function toggleFocus() {
		app.prefs.focusMode = !app.prefs.focusMode;
		app.persistPrefs();
	}
</script>

<svelte:head>
	<title>{chapter.nameSimple} · Tadabbur</title>
</svelte:head>

<main bind:this={main} class="min-w-0 grow overflow-y-auto">
	<div class="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-10">
		<header class="flex items-start justify-between gap-4 pt-8 pb-6 sm:pt-10">
			<div class="min-w-0">
				<h1 class="text-ink text-xl font-semibold tracking-tight sm:text-2xl">
					{chapter.nameSimple}
				</h1>
				{#if !app.prefs.focusMode}
					<p class="text-faint mt-1 text-sm">
						{chapterName(chapter)} · {m.verses_count({ count: chapter.versesCount })} ·
						{chapter.revelationPlace === 'makkah' ? m.makkah() : m.madinah()}
					</p>
				{/if}
			</div>
			<div class="flex shrink-0 items-center gap-1">
				<button
					type="button"
					class="rounded-lg p-2 transition-colors
						{app.prefs.focusMode
						? 'bg-accent-soft text-accent'
						: 'text-faint hover:bg-edge-soft hover:text-body'}"
					title={m.focus_mode()}
					aria-label={m.focus_mode()}
					aria-pressed={app.prefs.focusMode}
					onclick={toggleFocus}
				>
					<Icon name="focus" />
				</button>
				{#if !app.prefs.infoOpen && !app.prefs.focusMode}
					<button
						type="button"
						class="text-faint hover:bg-edge-soft hover:text-body hidden rounded-lg p-2 transition-colors xl:block"
						title={m.show_info()}
						aria-label={m.show_info()}
						onclick={() => {
							app.prefs.infoOpen = true;
							app.persistPrefs();
						}}
					>
						<Icon name="panel" />
					</button>
				{/if}
			</div>
		</header>

		{#if chapter.bismillahPre}
			<p
				dir="rtl"
				lang="ar"
				class="font-arabic border-edge-soft text-ink border-y py-6 text-center text-3xl"
			>
				بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
			</p>
		{/if}

		{#if surahData}
			{#each surahData.verses as verse (verse.key)}
				<VerseCard surah={surahData.surah} {verse} />
			{/each}
		{:else}
			{#each skeletonRows as i (i)}
				<div class="border-edge-soft animate-pulse border-b py-6">
					<div class="bg-edge-soft h-10 w-full rounded-lg"></div>
					<div class="bg-edge-soft mt-4 h-4 w-4/5 rounded"></div>
					<div class="bg-edge-soft mt-2 h-4 w-3/5 rounded"></div>
				</div>
			{/each}
		{/if}

		<nav class="mt-10 flex items-center justify-between gap-4">
			{#if prev}
				<a
					href={resolve('/surah/[surah]', { surah: String(prev.number) })}
					class="bg-surface text-body hover:border-accent hover:text-accent flex items-center gap-2 rounded-xl border border-edge px-4 py-3 text-sm font-medium transition-colors"
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
					class="bg-surface text-body hover:border-accent hover:text-accent flex items-center gap-2 rounded-xl border border-edge px-4 py-3 text-sm font-medium transition-colors"
				>
					{next.number}. {next.nameSimple}
					<Icon name="chevron-right" size={16} />
				</a>
			{/if}
		</nav>
	</div>
</main>

{#if surahData && app.prefs.infoOpen && !app.prefs.focusMode}
	<InfoPane {chapter} {surahData} />
{/if}
