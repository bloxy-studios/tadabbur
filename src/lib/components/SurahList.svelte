<script lang="ts">
	import type { Chapter } from '$lib/quran/types';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

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
</script>

<div class="flex h-full flex-col">
	<div class="px-3 pb-2">
		<input
			type="search"
			bind:value={query}
			placeholder="Filter surahs…"
			class="w-full rounded-lg border-stone-200 bg-white px-3 py-1.5 text-sm placeholder:text-stone-400 focus:border-accent focus:ring-accent"
		/>
	</div>

	<ul class="grow overflow-y-auto px-2 pb-4">
		{#each filtered as chapter (chapter.number)}
			<li>
				<a
					href={resolve('/surah/[surah]', { surah: String(chapter.number) })}
					class="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors
						{active === chapter.number ? 'bg-accent-soft' : 'hover:bg-stone-100'}"
				>
					<span
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold
							{active === chapter.number
							? 'bg-accent text-white'
							: 'bg-stone-100 text-stone-500 group-hover:bg-white'}"
					>
						{chapter.number}
					</span>
					<span class="min-w-0 grow">
						<span class="block truncate text-sm font-medium text-stone-800"
							>{chapter.nameSimple}</span
						>
						<span class="block truncate text-xs text-stone-400">
							{chapter.nameEn} · {chapter.versesCount} verses
						</span>
					</span>
					<span class="font-arabic shrink-0 text-lg text-stone-500">{chapter.nameArabic}</span>
				</a>
			</li>
		{:else}
			<li class="px-3 py-6 text-center text-sm text-stone-400">No surah matches “{query}”</li>
		{/each}
	</ul>
</div>
