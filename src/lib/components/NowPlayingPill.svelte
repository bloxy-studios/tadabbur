<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { dur } from '$lib/motion';
	import { player } from '$lib/player.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { Chapter } from '$lib/quran/types';
	import Icon from './Icon.svelte';

	let { chapters }: { chapters: Chapter[] } = $props();

	// Only surfaces when recitation is sounding (or paused) for a surah that
	// is NOT the one on screen — a way back to what's playing.
	const now = $derived.by(() => {
		const current = player.current;
		if (!current || page.params.surah === String(current.surah)) return null;
		return {
			...current,
			chapter: chapters[current.surah - 1],
			href: resolve('/surah/[surah]', { surah: String(current.surah) }) + `#v${current.verse}`
		};
	});
</script>

{#if now}
	<div class="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2">
		<div
			transition:fly={{ y: 12, duration: dur(180) }}
			class="bg-surface border-edge flex items-center gap-0.5 rounded-full border p-1 shadow-lg"
		>
			<button
				type="button"
				class="text-body hover:bg-edge-soft hover:text-ink rounded-full p-1.5 transition-colors no-hover:p-2.5"
				title={player.playing ? m.pause() : m.resume()}
				aria-label={player.playing ? m.pause() : m.resume()}
				onclick={() => player.togglePause()}
			>
				<Icon name={player.playing ? 'pause' : 'play'} size={16} />
			</button>
			<!-- eslint-disable svelte/no-navigation-without-resolve -- resolve()d in the derived, plus a #v hash the resolver can't express -->
			<a
				href={now.href}
				class="text-body hover:text-accent flex min-w-0 items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm font-medium transition-colors"
				title={m.now_playing()}
			>
				{#if player.playing}
					<span class="eq text-accent shrink-0" aria-hidden="true"><i></i><i></i><i></i></span>
				{/if}
				<span class="max-w-52 truncate">
					{now.surah}. {now.chapter.nameSimple} · {m.verse_n({ n: now.verse })}
				</span>
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
			<button
				type="button"
				class="text-faint hover:bg-edge-soft hover:text-body rounded-full p-1.5 transition-colors no-hover:p-2.5"
				title={m.stop_playback()}
				aria-label={m.stop_playback()}
				onclick={() => player.stop()}
			>
				<Icon name="close" size={14} />
			</button>
		</div>
	</div>
{/if}

<style>
	/* Tiny equalizer — "something is sounding" at a glance. */
	.eq {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		height: 12px;
	}
	.eq i {
		width: 2.5px;
		border-radius: 1px;
		background: currentColor;
		animation: eq 1s ease-in-out infinite;
	}
	.eq i:nth-child(2) {
		animation-delay: 0.25s;
	}
	.eq i:nth-child(3) {
		animation-delay: 0.5s;
	}
	@keyframes eq {
		0%,
		100% {
			height: 4px;
		}
		50% {
			height: 12px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.eq i {
			animation: none;
			height: 8px;
		}
	}
</style>
