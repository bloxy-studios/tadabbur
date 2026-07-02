<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { app, type SidebarView } from '$lib/app-state.svelte';
	import { m } from '$lib/paraglide/messages';
	import Icon from './Icon.svelte';

	const views: { view: SidebarView; icon: string; label: () => string }[] = [
		{ view: 'surahs', icon: 'list', label: m.nav_surahs },
		{ view: 'search', icon: 'search', label: m.nav_search }
	];

	const links: { href: '/progress' | '/settings'; icon: string; label: () => string }[] = [
		{ href: '/progress', icon: 'chart', label: m.nav_progress },
		{ href: '/settings', icon: 'settings', label: m.nav_settings }
	];

	// Always resumes the exact last-read position — the one-tap way back into
	// the mushaf from settings/progress, instead of re-finding the verse.
	const readSurah = $derived(String(app.lastRead?.surah ?? 1));
	const readHash = $derived(app.lastRead ? `#v${app.lastRead.verse}` : '');
	const reading = $derived(page.url.pathname.startsWith('/surah') && !app.mobileSidebarOpen);

	const itemBase =
		'flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 transition-colors';

	function viewClass(view: SidebarView): string {
		return app.view === view && app.mobileSidebarOpen ? 'text-accent' : 'text-faint';
	}

	function linkClass(href: string): string {
		return page.url.pathname === href && !app.mobileSidebarOpen ? 'text-accent' : 'text-faint';
	}
</script>

<nav
	class="bg-paper border-edge fixed inset-x-0 bottom-0 z-50 flex border-t pb-[env(safe-area-inset-bottom)] md:hidden"
	aria-label="Primary"
>
	<!-- the href is resolve()-built; the rule can't see past the appended #verse hash -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		href={resolve('/surah/[surah]', { surah: readSurah }) + readHash}
		class="{itemBase} {reading ? 'text-accent' : 'text-faint'}"
		aria-current={reading ? 'page' : undefined}
		onclick={() => app.closeMobileSidebar()}
	>
		<Icon name="book" size={22} />
		<span class="text-[10px] font-medium">{m.nav_read()}</span>
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
	{#each views as item (item.view)}
		<button
			type="button"
			class="{itemBase} {viewClass(item.view)}"
			aria-pressed={app.view === item.view && app.mobileSidebarOpen}
			onclick={() => app.toggleSidebar(item.view)}
		>
			<Icon name={item.icon} size={22} />
			<span class="text-[10px] font-medium">{item.label()}</span>
		</button>
	{/each}
	{#each links as item (item.href)}
		<a
			href={resolve(item.href)}
			class="{itemBase} {linkClass(item.href)}"
			aria-current={page.url.pathname === item.href ? 'page' : undefined}
			onclick={() => app.closeMobileSidebar()}
		>
			<Icon name={item.icon} size={22} />
			<span class="text-[10px] font-medium">{item.label()}</span>
		</a>
	{/each}
</nav>
