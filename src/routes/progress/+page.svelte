<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { app } from '$lib/app-state.svelte';
	import { computeStreak, dateKey, lastNDays } from '$lib/progress';
	import { chapterName } from '$lib/quran/locale';
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Activity lives in localStorage, so show the real numbers only after
	// hydration — the server always renders the empty skeleton.
	let ready = $state(false);
	onMount(() => (ready = true));

	const days = lastNDays(14);
	const todayKey = dateKey(new Date());

	const counts = $derived(days.map((day) => app.activity[day.key]?.length ?? 0));
	const maxCount = $derived(Math.max(1, ...counts));
	const streak = $derived(computeStreak(app.activity));
	const today = $derived(app.activity[todayKey]?.length ?? 0);

	const started = $derived(
		Object.entries(app.surahProgress)
			.map(([surah, maxVerse]) => {
				const chapter = data.chapters[Number(surah) - 1];
				return {
					chapter,
					maxVerse: Math.min(maxVerse, chapter.versesCount),
					pct: Math.min(100, Math.round((maxVerse / chapter.versesCount) * 100))
				};
			})
			.sort((a, b) => b.pct - a.pct || a.chapter.number - b.chapter.number)
	);
	const completedCount = $derived(started.filter((s) => s.pct >= 100).length);
	const quranPct = $derived(
		((started.reduce((sum, s) => sum + s.maxVerse, 0) / 6236) * 100).toFixed(1)
	);

	const stats = $derived([
		{ label: m.streak_days(), value: String(streak) },
		{ label: m.verses_today(), value: String(today) },
		{ label: m.surahs_completed(), value: String(completedCount) },
		{ label: m.quran_read(), value: `${quranPct}%` }
	]);

	function dayLabel(date: Date): string {
		return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
	}
</script>

<svelte:head>
	<title>{m.nav_progress()} · Tadabbur</title>
</svelte:head>

<main
	id="main-content"
	data-pane
	tabindex="-1"
	class="min-w-0 grow overflow-y-auto focus:outline-none"
>
	<div class="mx-auto max-w-3xl px-4 pt-8 pb-24 sm:px-6 sm:pt-10 lg:px-10">
		<h1 class="text-ink text-xl font-semibold tracking-tight sm:text-2xl">{m.nav_progress()}</h1>

		<div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each stats as stat (stat.label)}
				<div class="bg-surface rounded-2xl border border-edge p-4">
					<p class="text-ink text-2xl font-semibold tabular-nums">{ready ? stat.value : '–'}</p>
					<p class="text-faint mt-0.5 text-xs font-medium">{stat.label}</p>
				</div>
			{/each}
		</div>

		<section class="bg-surface mt-4 rounded-2xl border border-edge p-5">
			<h2 class="text-faint text-xs font-semibold tracking-widest uppercase">
				{m.last_14_days()}
			</h2>
			<div class="border-edge-soft mt-4 flex h-36 items-end gap-1 border-b" aria-hidden="true">
				{#each days as day, i (day.key)}
					<div class="group relative flex h-full flex-1 items-end justify-center">
						{#if ready && counts[i] > 0}
							<div
								class="bg-chart w-full max-w-6 rounded-t"
								style="height: {Math.max(4, (counts[i] / maxCount) * 100)}%"
							></div>
						{:else}
							<div class="bg-edge-soft h-0.5 w-full max-w-6"></div>
						{/if}
						<span
							class="bg-ink text-paper pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[11px] whitespace-nowrap group-hover:block"
						>
							{ready ? counts[i] : 0} · {dayLabel(day.date)}
						</span>
					</div>
				{/each}
			</div>
			<div class="text-faint mt-1.5 flex justify-between text-[11px]">
				<span>{dayLabel(days[0].date)}</span>
				<span>{dayLabel(days[days.length - 1].date)}</span>
			</div>
			<table class="sr-only">
				<caption>{m.verses_read_per_day()}</caption>
				<tbody>
					{#each days as day, i (day.key)}
						<tr><th scope="row">{day.key}</th><td>{ready ? counts[i] : 0}</td></tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section class="mt-8">
			<h2 class="text-faint text-xs font-semibold tracking-widest uppercase">
				{m.in_progress_surahs()}
			</h2>
			{#if ready && started.length > 0}
				<ul class="mt-2">
					{#each started as item (item.chapter.number)}
						<li>
							<a
								href={resolve('/surah/[surah]', { surah: String(item.chapter.number) })}
								class="hover:bg-edge-soft flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors"
							>
								<span
									class="bg-edge-soft text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
								>
									{item.chapter.number}
								</span>
								<span class="min-w-0 grow">
									<span class="flex items-baseline justify-between gap-2">
										<span class="text-ink truncate text-sm font-medium">
											{item.chapter.nameSimple}
											<span class="text-faint font-normal">· {chapterName(item.chapter)}</span>
										</span>
										<span class="text-faint shrink-0 text-xs tabular-nums">
											{item.pct >= 100
												? m.completed()
												: `${item.maxVerse}/${item.chapter.versesCount}`}
										</span>
									</span>
									<span class="bg-edge-soft mt-1.5 block h-1.5 overflow-hidden rounded-full">
										<span class="bg-chart block h-full rounded-full" style="width: {item.pct}%"
										></span>
									</span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-faint mt-3 text-sm">{m.progress_empty()}</p>
			{/if}
		</section>
	</div>
</main>
