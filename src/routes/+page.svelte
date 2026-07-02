<script lang="ts">
	import { resolve } from '$app/paths';
	import { app } from '$lib/app-state.svelte';
	import { chapterName } from '$lib/quran/locale';
	import { m } from '$lib/paraglide/messages';
	import Icon from '$lib/components/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const hour = new Date().getHours();
	const greeting =
		hour < 4 || hour >= 18
			? m.greeting_evening
			: hour < 11
				? m.greeting_morning
				: m.greeting_afternoon;

	const lastChapter = $derived(app.lastRead ? data.chapters[app.lastRead.surah - 1] : null);

	// Familiar starting points for a fresh session.
	const suggestions = [1, 18, 36, 55, 67].map((n) => data.chapters[n - 1]);
</script>

<main id="main-content" tabindex="-1" class="min-w-0 grow overflow-y-auto focus:outline-none">
	<div class="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 sm:pt-20">
		<p class="font-arabic text-accent text-center text-5xl">تدبر</p>
		<h1 class="text-ink mt-6 text-center text-2xl font-semibold tracking-tight">
			{greeting()}
		</h1>
		<p class="text-faint mx-auto mt-2 max-w-md text-center text-sm leading-relaxed">
			{m.home_tagline()}
		</p>

		{#if lastChapter && app.lastRead}
			<a
				href="{resolve('/surah/[surah]', { surah: String(app.lastRead.surah) })}#v{app.lastRead
					.verse}"
				class="bg-surface hover:border-accent mt-10 flex items-center gap-4 rounded-2xl border border-edge p-5 transition-colors"
			>
				<span
					class="bg-accent-soft text-accent flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
				>
					<Icon name="book" />
				</span>
				<span class="min-w-0 grow">
					<span class="text-faint block text-xs font-medium tracking-wide uppercase">
						{m.continue_reading()}
					</span>
					<span class="text-ink mt-0.5 block truncate text-sm font-semibold">
						{lastChapter.nameSimple}, {m.verse_n({ n: app.lastRead.verse })}
					</span>
				</span>
				<Icon name="chevron-right" size={16} class="text-faint shrink-0" />
			</a>
		{/if}

		<h2 class="text-faint mt-12 text-xs font-semibold tracking-widest uppercase">
			{lastChapter ? m.or_start_new() : m.start_reading()}
		</h2>
		<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
			{#each suggestions as chapter (chapter.number)}
				<a
					href={resolve('/surah/[surah]', { surah: String(chapter.number) })}
					class="bg-surface hover:border-accent flex items-center justify-between rounded-xl border border-edge px-4 py-3 transition-colors"
				>
					<span>
						<span class="text-ink block text-sm font-medium">
							{chapter.number}. {chapter.nameSimple}
						</span>
						<span class="text-faint block text-xs">
							{chapterName(chapter)} · {m.verses_count({ count: chapter.versesCount })}
						</span>
					</span>
					<span class="font-arabic text-muted text-xl">{chapter.nameArabic}</span>
				</a>
			{/each}
		</div>
	</div>
</main>
