<script lang="ts">
	import { app } from '$lib/app-state.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { Chapter } from '$lib/quran/types';
	import SurahList from './SurahList.svelte';
	import SearchView from './SearchView.svelte';
	import NotesView from './NotesView.svelte';
	import SettingsView from './SettingsView.svelte';

	let { chapters }: { chapters: Chapter[] } = $props();

	const titles = {
		surahs: m.nav_surahs,
		search: m.nav_search,
		notes: m.nav_notes,
		settings: m.nav_settings
	} as const;
</script>

<aside class="bg-paper flex h-full w-72 shrink-0 flex-col border-r border-edge">
	<h2 class="text-faint px-4 pt-4 pb-2 text-xs font-semibold tracking-widest uppercase">
		{titles[app.view]()}
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
