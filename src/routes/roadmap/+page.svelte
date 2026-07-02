<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	const groups = [
		{
			title: m.roadmap_done,
			dot: 'bg-accent',
			items: [
				m.rm_reader,
				m.rm_audio,
				m.rm_tafsir,
				m.rm_offline,
				m.rm_themes,
				m.rm_search,
				m.rm_progress
			]
		},
		{
			title: m.roadmap_next,
			dot: 'bg-chart',
			items: [m.rm_notes, m.rm_sync]
		},
		{
			title: m.roadmap_later,
			dot: 'bg-faint',
			items: [m.rm_hifz, m.rm_reciters, m.rm_share]
		}
	];
</script>

<svelte:head>
	<title>{m.roadmap_title()} · Tadabbur</title>
</svelte:head>

<main
	id="main-content"
	data-pane
	tabindex="-1"
	class="min-w-0 grow overflow-y-auto focus:outline-none"
>
	<div class="mx-auto max-w-3xl px-4 pt-8 pb-24 sm:px-6 sm:pt-10 lg:px-10">
		<h1 class="text-ink text-xl font-semibold tracking-tight sm:text-2xl">{m.roadmap_title()}</h1>
		<p class="text-muted mt-1 max-w-xl text-sm leading-relaxed">
			{m.roadmap_lede()}
			<a
				href="https://github.com/fahreziadh/tadabbur/issues"
				target="_blank"
				rel="noopener"
				class="text-accent hover:underline">GitHub →</a
			>
		</p>

		<div class="mt-8 flex flex-col gap-6">
			{#each groups as group (group.title)}
				<section class="bg-surface overflow-hidden rounded-2xl border border-edge">
					<h2
						class="text-faint border-b border-edge-soft px-5 py-3 text-xs font-semibold tracking-widest uppercase"
					>
						{group.title()}
					</h2>
					<ul class="divide-y divide-edge-soft">
						{#each group.items as item (item)}
							<li class="text-body flex items-center gap-3 px-5 py-3 text-sm">
								<span class="size-1.5 shrink-0 rounded-full {group.dot}"></span>
								{item()}
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	</div>
</main>
