<script lang="ts">
	import { app } from '$lib/app-state.svelte';
	import type { Chapter } from '$lib/quran/types';
	import SurahList from './SurahList.svelte';
	import SearchView from './SearchView.svelte';
	import NotesView from './NotesView.svelte';
	import SettingsView from './SettingsView.svelte';

	let { chapters }: { chapters: Chapter[] } = $props();

	const titles = {
		surahs: 'Surahs',
		search: 'Search',
		notes: 'Notes',
		settings: 'Settings'
	} as const;
</script>

<aside class="flex w-72 shrink-0 flex-col border-r border-stone-200 bg-paper">
	<h2 class="px-4 pt-4 pb-2 text-xs font-semibold tracking-widest text-stone-400 uppercase">
		{titles[app.view]}
	</h2>

	{#if app.view === 'surahs'}
		<SurahList {chapters} />
	{:else if app.view === 'search'}
		<SearchView {chapters} />
	{:else if app.view === 'notes'}
		<NotesView />
	{:else}
		<SettingsView />
	{/if}
</aside>
