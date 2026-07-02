<script lang="ts">
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import Icon from '$lib/components/Icon.svelte';

	const features = [
		{ title: m.feat_offline_t, body: m.feat_offline_b },
		{ title: m.feat_words_t, body: m.feat_words_b },
		{ title: m.feat_audio_t, body: m.feat_audio_b },
		{ title: m.feat_tafsir_t, body: m.feat_tafsir_b },
		{ title: m.feat_themes_t, body: m.feat_themes_b },
		{ title: m.feat_keyboard_t, body: m.feat_keyboard_b }
	];

	const sources = [
		{ title: m.src_quran_t, body: m.src_quran_b },
		{ title: m.src_trans_t, body: m.src_trans_b },
		{ title: m.src_tafsir_t, body: m.src_tafsir_b },
		{ title: m.src_audio_t, body: m.src_audio_b }
	];
</script>

<svelte:head>
	<title>{m.about_title()} · Tadabbur</title>
</svelte:head>

<main
	id="main-content"
	data-pane
	tabindex="-1"
	class="min-w-0 grow overflow-y-auto focus:outline-none"
>
	<div class="mx-auto max-w-3xl px-4 pt-8 pb-24 sm:px-6 sm:pt-10 lg:px-10">
		<p class="font-arabic text-accent text-5xl">تدبر</p>
		<h1 class="text-ink mt-4 text-xl font-semibold tracking-tight sm:text-2xl">Tadabbur</h1>
		<p class="text-body mt-3 max-w-xl text-sm leading-relaxed">{m.about_lede()}</p>

		<div class="mt-8 flex flex-col gap-6">
			<section class="bg-surface overflow-hidden rounded-2xl border border-edge">
				<h2
					class="text-faint border-b border-edge-soft px-5 py-3 text-xs font-semibold tracking-widest uppercase"
				>
					{m.about_features_title()}
				</h2>
				<div class="grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2">
					{#each features as feature (feature.title)}
						<div>
							<h3 class="text-ink text-sm font-medium">{feature.title()}</h3>
							<p class="text-muted mt-1 text-xs leading-relaxed">{feature.body()}</p>
						</div>
					{/each}
				</div>
			</section>

			<section class="bg-surface overflow-hidden rounded-2xl border border-edge">
				<h2
					class="text-faint border-b border-edge-soft px-5 py-3 text-xs font-semibold tracking-widest uppercase"
				>
					{m.about_sources_title()}
				</h2>
				<div class="divide-y divide-edge-soft">
					{#each sources as source (source.title)}
						<div class="px-5 py-4">
							<h3 class="text-ink text-sm font-medium">{source.title()}</h3>
							<p class="text-muted mt-0.5 text-xs leading-relaxed">{source.body()}</p>
						</div>
					{/each}
				</div>
			</section>

			<section class="bg-surface overflow-hidden rounded-2xl border border-edge">
				<h2
					class="text-faint border-b border-edge-soft px-5 py-3 text-xs font-semibold tracking-widest uppercase"
				>
					{m.about_open_title()}
				</h2>
				<div class="px-5 py-4">
					<p class="text-muted text-xs leading-relaxed">{m.about_open_body()}</p>
					<div class="mt-3 flex flex-wrap gap-2">
						<a
							href="https://github.com/fahreziadh/tadabbur"
							target="_blank"
							rel="noopener"
							class="bg-paper text-body hover:border-accent hover:text-accent inline-flex items-center gap-1.5 rounded-lg border border-edge px-3 py-1.5 text-xs font-medium transition-colors"
						>
							<Icon name="link" size={14} />
							{m.about_github()}
						</a>
						<a
							href={resolve('/roadmap')}
							class="bg-paper text-body hover:border-accent hover:text-accent inline-flex items-center gap-1.5 rounded-lg border border-edge px-3 py-1.5 text-xs font-medium transition-colors"
						>
							<Icon name="chart" size={14} />
							{m.about_roadmap_link()}
						</a>
					</div>
				</div>
			</section>
		</div>
	</div>
</main>
