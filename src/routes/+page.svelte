<script lang="ts">
	import { resolve } from '$app/paths';
	import { app } from '$lib/app-state.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const hour = new Date().getHours();
	const greeting =
		hour < 4 || hour >= 18 ? 'Good evening' : hour < 11 ? 'Good morning' : 'Good afternoon';

	const lastChapter = $derived(app.lastRead ? data.chapters[app.lastRead.surah - 1] : null);

	// Familiar starting points for a fresh session.
	const suggestions = [1, 18, 36, 55, 67].map((n) => data.chapters[n - 1]);
</script>

<main class="min-w-0 grow overflow-y-auto">
	<div class="mx-auto max-w-2xl px-6 pt-20 pb-24">
		<p class="font-arabic text-center text-5xl text-accent">تدبر</p>
		<h1 class="mt-6 text-center text-2xl font-semibold tracking-tight text-stone-900">
			{greeting}.
		</h1>
		<p class="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-stone-400">
			Read, reflect and take your time with the Quran — with translations and tafsir alongside the
			Uthmani text.
		</p>

		{#if lastChapter && app.lastRead}
			<a
				href="{resolve('/surah/[surah]', { surah: String(app.lastRead.surah) })}#v{app.lastRead
					.verse}"
				class="mt-10 flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition-colors hover:border-accent"
			>
				<span
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"
				>
					<Icon name="book" />
				</span>
				<span class="min-w-0 grow">
					<span class="block text-xs font-medium tracking-wide text-stone-400 uppercase">
						Pick up where you left off
					</span>
					<span class="mt-0.5 block truncate text-sm font-semibold text-stone-800">
						{lastChapter.nameSimple}, verse {app.lastRead.verse}
					</span>
				</span>
				<Icon name="chevron-right" size={16} class="shrink-0 text-stone-300" />
			</a>
		{/if}

		<h2 class="mt-12 text-xs font-semibold tracking-widest text-stone-400 uppercase">
			{lastChapter ? 'Or start somewhere new' : 'Start reading'}
		</h2>
		<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
			{#each suggestions as chapter (chapter.number)}
				<a
					href={resolve('/surah/[surah]', { surah: String(chapter.number) })}
					class="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 transition-colors hover:border-accent"
				>
					<span>
						<span class="block text-sm font-medium text-stone-800">
							{chapter.number}. {chapter.nameSimple}
						</span>
						<span class="block text-xs text-stone-400"
							>{chapter.nameEn} · {chapter.versesCount} verses</span
						>
					</span>
					<span class="font-arabic text-xl text-stone-500">{chapter.nameArabic}</span>
				</a>
			{/each}
		</div>
	</div>
</main>
