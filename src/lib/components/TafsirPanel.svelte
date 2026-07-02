<script lang="ts">
	import { slide } from 'svelte/transition';
	import { getTafsir } from '$lib/quran/data';
	import { dur } from '$lib/motion';
	import type { TafsirEntry, TafsirSlug } from '$lib/quran/types';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import Icon from './Icon.svelte';

	let { surah, verse }: { surah: number; verse: number } = $props();

	interface Source {
		slug: TafsirSlug;
		label: string;
		/** Ibn Kathir ships as HTML; the Indonesian tafsirs are plain text. */
		html: boolean;
	}

	// English readers get Ibn Kathir; Indonesian readers get Tafsir Kemenag,
	// Al-Mukhtasar, and As-Sa'di, plus Ibn Kathir (in English) as an extra
	// source — no properly-licensed Indonesian Ibn Kathir exists.
	const sources: Source[] =
		getLocale() === 'id'
			? [
					{ slug: 'kemenag', label: 'Tafsir Kemenag', html: false },
					{ slug: 'mukhtasar', label: 'Al-Mukhtasar', html: false },
					{ slug: 'as-saadi', label: "As-Sa'di", html: false },
					{ slug: 'ibn-kathir', label: 'Ibn Kathir (EN)', html: true }
				]
			: [{ slug: 'ibn-kathir', label: 'Ibn Kathir', html: true }];

	let selected: Source = $state(sources[0]);
	let dialog: HTMLDialogElement;

	async function loadEntry(slug: TafsirSlug): Promise<TafsirEntry | undefined> {
		const data = await getTafsir(fetch, slug, surah);
		return data.entries.find((e) => verse >= e.from && verse <= e.to);
	}

	const entry = $derived(loadEntry(selected.slug));
</script>

{#snippet tabs()}
	{#each sources as source (source.slug)}
		<button
			type="button"
			class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors
				{selected.slug === source.slug ? 'bg-accent-soft text-accent' : 'text-faint hover:text-body'}"
			onclick={() => (selected = source)}
		>
			{source.label}
		</button>
	{/each}
{/snippet}

{#snippet body(large: boolean)}
	{#await entry}
		<p class="text-faint py-2 text-sm">{m.tafsir_loading()}</p>
	{:then found}
		<!-- Slide the loaded content open so the height change never snaps. -->
		<div in:slide={{ duration: dur(180) }}>
			{#if !found}
				<p class="text-faint py-2 text-sm">{m.tafsir_none()}</p>
			{:else}
				{#if found.from !== found.to}
					<p class="text-faint mb-2 text-xs font-medium">
						{m.tafsir_covers({ from: found.from, to: found.to })}
					</p>
				{/if}
				{#if selected.html}
					<div
						class="prose prose-stone dark:prose-invert max-w-none {large
							? 'prose-base [&_h1]:text-lg [&_h2]:text-base'
							: 'prose-sm [&_h1]:text-base [&_h2]:text-sm'}"
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted static tafsir content built by our own data script -->
						{@html found.text}
					</div>
				{:else}
					<p
						class="text-body leading-relaxed whitespace-pre-line {large ? 'text-base' : 'text-sm'}"
					>
						{found.text}
					</p>
				{/if}
			{/if}
		</div>
	{:catch}
		<p class="py-2 text-sm text-red-500">{m.tafsir_error()}</p>
	{/await}
{/snippet}

<div class="bg-surface mt-3 rounded-xl border border-edge">
	<div class="border-edge-soft flex items-center gap-1 border-b px-3 py-2">
		{#if sources.length > 1}
			{@render tabs()}
		{:else}
			<span class="text-faint px-1 text-xs font-semibold">{sources[0].label}</span>
		{/if}
		<span class="grow"></span>
		<button
			type="button"
			class="text-faint hover:bg-edge-soft hover:text-body rounded-md p-1.5 transition-colors"
			title={m.open_full_view()}
			aria-label={m.open_full_view()}
			onclick={() => dialog.showModal()}
		>
			<Icon name="maximize" size={15} />
		</button>
	</div>

	<div class="max-h-96 overflow-y-auto px-4 py-3">
		{@render body(false)}
	</div>
</div>

<!-- Backdrop click closes; Esc already closes natively. -->
<dialog
	bind:this={dialog}
	onclick={(event) => {
		if (event.target === dialog) dialog.close();
	}}
	class="bg-surface m-auto w-[min(48rem,calc(100vw-2rem))] rounded-2xl shadow-2xl backdrop:bg-black/50"
>
	<div class="flex max-h-[85vh] flex-col">
		<div class="border-edge-soft flex items-center gap-2 border-b px-5 py-3">
			<span class="text-ink mr-2 text-sm font-semibold">
				{m.tafsir()} · {surah}:{verse}
			</span>
			{#if sources.length > 1}
				{@render tabs()}
			{:else}
				<span class="text-faint text-xs font-semibold">{sources[0].label}</span>
			{/if}
			<span class="grow"></span>
			<button
				type="button"
				class="text-faint hover:bg-edge-soft hover:text-body rounded-md p-1.5 transition-colors"
				title={m.close()}
				aria-label={m.close()}
				onclick={() => dialog.close()}
			>
				<Icon name="close" size={16} />
			</button>
		</div>
		<div class="overflow-y-auto px-6 py-5">
			{@render body(true)}
		</div>
	</div>
</dialog>
