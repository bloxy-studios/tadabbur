<script lang="ts">
	import type { Chapter } from '$lib/quran/types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { chapterName } from '$lib/quran/locale';

	let { chapters }: { chapters: Chapter[] } = $props();

	let query = $state('');

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return chapters;
		return chapters.filter(
			(c) =>
				String(c.number) === q ||
				c.nameSimple.toLowerCase().includes(q) ||
				c.nameEn.toLowerCase().includes(q) ||
				c.nameId.toLowerCase().includes(q) ||
				c.nameArabic.includes(q)
		);
	});

	const active = $derived(Number(page.params.surah));

	// Enter in the filter opens the first match.
	function onFilterKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || !filtered.length) return;
		event.preventDefault();
		void goto(resolve('/surah/[surah]', { surah: String(filtered[0].number) }));
	}
</script>

<div class="flex min-h-0 grow flex-col">
	<div class="px-3 pb-2">
		<input
			type="search"
			bind:value={query}
			onkeydown={onFilterKeydown}
			placeholder={m.filter_surahs()}
			class="bg-surface placeholder:text-faint focus:border-accent focus:ring-accent w-full rounded-lg border-edge px-3 py-1.5 text-sm"
		/>
	</div>

	<ul class="grow overflow-y-auto px-2 pb-4">
		{#each filtered as chapter (chapter.number)}
			<li>
				<a
					href={resolve('/surah/[surah]', { surah: String(chapter.number) })}
					aria-current={active === chapter.number ? 'page' : undefined}
					class="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors
						{active === chapter.number ? 'bg-accent-soft' : 'hover:bg-edge-soft'}"
				>
					<span
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold
							{active === chapter.number
							? 'bg-accent text-on-accent'
							: 'bg-edge-soft text-muted group-hover:bg-surface'}"
					>
						{chapter.number}
					</span>
					<span class="min-w-0 grow">
						<span class="text-ink block truncate text-sm font-medium">{chapter.nameSimple}</span>
						<span
							class="block truncate text-xs {active === chapter.number
								? 'text-accent'
								: 'text-faint'}"
						>
							{chapterName(chapter)} · {m.verses_count({ count: chapter.versesCount })}
						</span>
					</span>
					<span
						class="font-arabic shrink-0 text-lg {active === chapter.number
							? 'text-accent'
							: 'text-muted'}">{chapter.nameArabic}</span
					>
				</a>
			</li>
		{:else}
			<li class="px-3 py-6 text-center text-sm text-faint">{m.no_surah_match({ query })}</li>
		{/each}
	</ul>
</div>
