<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { fade, fly } from 'svelte/transition';
	import { afterNavigate } from '$app/navigation';
	import { getSurah } from '$lib/quran/data';
	import { dur } from '$lib/motion';
	import { app, arabicFontStacks } from '$lib/app-state.svelte';
	import ActivityBar from '$lib/components/ActivityBar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	function onKeydown(event: KeyboardEvent) {
		if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
		if (event.key === 'b') {
			event.preventDefault();
			app.toggleSidebar();
		} else if (event.key === 'f') {
			// Native find can't see lazily-mounted verses — our search can.
			event.preventDefault();
			app.focusSearch();
		}
	}

	afterNavigate(() => app.closeMobileSidebar());

	// Theme is a class on <html> so it can differ from the OS preference.
	$effect(() => {
		const theme = app.prefs.theme;
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const apply = () =>
			document.documentElement.classList.toggle(
				'dark',
				theme === 'dark' || (theme === 'system' && media.matches)
			);
		apply();
		media.addEventListener('change', apply);
		return () => media.removeEventListener('change', apply);
	});

	$effect(() => {
		document.documentElement.style.setProperty(
			'--arabic-font',
			arabicFontStacks[app.prefs.arabicFont]
		);
	});

	// Local-first: once the app settles, quietly pull every surah into memory
	// (~8.6MB JSON) during idle time so any surah switch is instant.
	$effect(() => {
		// navigator.connection is non-standard, hence the manual typing.
		const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
		if (connection?.saveData) return;
		let cancelled = false;
		let n = 1;
		const schedule = (fn: () => void) =>
			'requestIdleCallback' in window
				? requestIdleCallback(fn, { timeout: 1000 })
				: setTimeout(fn, 150);
		const next = () => {
			if (cancelled || n > 114) return;
			getSurah(fetch, n++)
				.catch(() => {})
				.finally(() => schedule(next));
		};
		const timer = setTimeout(() => next(), 2000);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Tadabbur</title>
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<div class="flex h-dvh overflow-hidden">
	<ActivityBar />

	{#if app.mobileSidebarOpen}
		<button
			type="button"
			class="fixed inset-0 z-30 bg-black/40 md:hidden"
			aria-label="Close sidebar"
			transition:fade={{ duration: dur(150) }}
			onclick={() => app.closeMobileSidebar()}
		></button>
	{/if}

	{#if app.mobileSidebarOpen || app.prefs.sidebarOpen}
		<div
			transition:fly={{ x: -16, duration: dur(180) }}
			class="{app.mobileSidebarOpen ? 'fixed inset-y-0 left-12 z-40 flex shadow-xl' : 'hidden'} {app
				.prefs.sidebarOpen
				? 'md:static md:z-auto md:flex md:shadow-none'
				: 'md:hidden'}"
		>
			<Sidebar chapters={data.chapters} />
		</div>
	{/if}

	{@render children()}
</div>
