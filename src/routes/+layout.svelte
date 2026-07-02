<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { app } from '$lib/app-state.svelte';
	import ActivityBar from '$lib/components/ActivityBar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	function onKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
			event.preventDefault();
			app.toggleSidebar();
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Tadabbur</title>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="flex h-dvh overflow-hidden">
	<ActivityBar />

	{#if app.prefs.sidebarOpen}
		<div class="hidden md:contents">
			<Sidebar chapters={data.chapters} />
		</div>
	{/if}

	{@render children()}
</div>
