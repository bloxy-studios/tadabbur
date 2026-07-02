<script lang="ts">
	import { resolve } from '$app/paths';
	import { app, type SidebarView } from '$lib/app-state.svelte';
	import Icon from './Icon.svelte';

	const items: { view: SidebarView; icon: string; label: string }[] = [
		{ view: 'surahs', icon: 'book', label: 'Surahs' },
		{ view: 'search', icon: 'search', label: 'Search' },
		{ view: 'notes', icon: 'note', label: 'Notes' }
	];
</script>

<nav
	class="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-stone-200 bg-paper py-3"
	aria-label="Primary"
>
	<a
		href={resolve('/')}
		class="mb-2 flex h-9 w-9 items-center justify-center rounded-lg text-accent"
		title="Home"
	>
		<span class="font-arabic text-2xl leading-none">ت</span>
	</a>

	{#each items as item (item.view)}
		<button
			type="button"
			class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors
				{app.view === item.view && app.prefs.sidebarOpen
				? 'bg-accent-soft text-accent'
				: 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}"
			title={item.label}
			aria-label={item.label}
			onclick={() => app.toggleSidebar(item.view)}
		>
			<Icon name={item.icon} />
		</button>
	{/each}

	<div class="grow"></div>

	<button
		type="button"
		class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors
			{app.view === 'settings' && app.prefs.sidebarOpen
			? 'bg-accent-soft text-accent'
			: 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'}"
		title="Settings"
		aria-label="Settings"
		onclick={() => app.toggleSidebar('settings')}
	>
		<Icon name="settings" />
	</button>
</nav>
