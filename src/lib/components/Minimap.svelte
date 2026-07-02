<script lang="ts">
	import { player } from '$lib/player.svelte';
	import { m } from '$lib/paraglide/messages';

	/**
	 * Blog-style minimap rail on the right edge of the reader: one line per
	 * verse (width hints at verse length), a viewport window, and an accent
	 * tick on the verse being recited. Hover shows the verse key; click or
	 * drag scrubs the scroll. Must be the first child of the scrolling
	 * <main> — it sticks to the pane top and measures its next sibling.
	 */
	let { surah, loaded }: { surah: number; loaded: boolean } = $props();

	let root = $state<HTMLElement>();

	const TICK_W = 12;

	let railH = $state(0);
	let railTop = $state(12);
	let scrollable = $state(false);
	let ticks = $state<{ n: number; frac: number }[]>([]);
	let view = $state({ top: 0, height: 1 });
	let hover = $state<{ y: number; n: number } | null>(null);
	let dragging = $state(false);

	// Ticks are spaced evenly by index (whole-pixel tops), not by document
	// position — proportional placement made gaps wobble with verse length
	// and lazy-shell heights. Each tick still remembers its document frac
	// for scrubbing and the in-view band.
	function tickY(index: number): number {
		return Math.round(((index + 0.5) / ticks.length) * railH);
	}

	const playingY = $derived.by(() => {
		if (player.current?.surah !== surah) return null;
		const verse = player.current.verse;
		const index = ticks.findIndex((t) => t.n === verse);
		return index < 0 ? null : tickY(index);
	});

	const valuenow = $derived(
		view.height >= 1 ? 0 : Math.round((view.top / (1 - view.height)) * 100)
	);

	function main(): HTMLElement | null {
		return root?.closest('main') ?? null;
	}

	function updateView(el: HTMLElement) {
		const total = el.scrollHeight;
		view = { top: el.scrollTop / total, height: el.clientHeight / total };
	}

	function measure() {
		const el = main();
		if (!el) return;
		const total = el.scrollHeight;
		scrollable = loaded && total > el.clientHeight * 1.25;
		const paneTop = el.getBoundingClientRect().top;
		ticks = [...el.querySelectorAll<HTMLElement>('[data-verse]')].map((node) => ({
			n: Number(node.dataset.verse),
			frac: (node.getBoundingClientRect().top - paneTop + el.scrollTop) / total
		}));
		// The rail length follows the ayah count (~6px per tick, clamped to
		// the pane) and hangs 20% from the pane top — a 20-ayah surah reads
		// as a compact cluster, not 20 lines stretched across the screen.
		const avail = el.clientHeight - 24;
		railH = Math.min(avail, Math.max(ticks.length * 6, 48));
		railTop = Math.min(el.clientHeight * 0.2, 12 + avail - railH);
		updateView(el);
	}

	// Verse heights shift as lazy cards mount, so measures are rAF-coalesced —
	// and paused during a scrub, where every jump mounts cards and would
	// otherwise re-measure all verses per frame (visible stutter).
	let raf = 0;
	function scheduleMeasure() {
		if (dragging) return;
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(measure);
	}

	$effect(() => {
		const el = main();
		if (!el || !root) return;
		void surah;
		void loaded;
		scheduleMeasure();
		const observer = new ResizeObserver(scheduleMeasure);
		observer.observe(el);
		// The reader column right after this rail — grows as content loads.
		if (root.nextElementSibling) observer.observe(root.nextElementSibling);
		const onScroll = () => updateView(el);
		el.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			observer.disconnect();
			el.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(raf);
		};
	});

	/**
	 * Dock-style magnification: ticks swell as the cursor nears, on a
	 * gaussian falloff, so the rail bulges into a little mountain around
	 * the pointer. Pure scaleX from the right edge — paint only, no layout.
	 */
	function bump(y: number): number {
		if (!hover) return 1;
		const d = y - hover.y;
		return 1 + 1.4 * Math.exp(-(d * d) / (2 * 28 * 28));
	}

	function railFrac(event: PointerEvent): number {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		return (event.clientY - rect.top) / rect.height;
	}

	function indexFromEvent(event: PointerEvent): number {
		const frac = railFrac(event);
		return Math.max(0, Math.min(ticks.length - 1, Math.floor(frac * ticks.length)));
	}

	// Scrubbing snaps verse-by-verse, at most one scroll write per frame —
	// writing scrollTop on every pointermove stuttered badly.
	let scrubRaf = 0;
	let scrubIndex = -1;
	function queueScrub(index: number) {
		if (index === scrubIndex) return;
		scrubIndex = index;
		cancelAnimationFrame(scrubRaf);
		scrubRaf = requestAnimationFrame(() => {
			const el = main();
			const t = ticks[scrubIndex];
			if (!el || !t) return;
			el.scrollTop = Math.min(t.frac * el.scrollHeight - 12, el.scrollHeight - el.clientHeight);
		});
	}

	function updateHover(event: PointerEvent) {
		const index = indexFromEvent(event);
		hover = { y: tickY(index), n: ticks[index]?.n ?? 1 };
	}

	function onPointerDown(event: PointerEvent) {
		event.preventDefault();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		dragging = true;
		queueScrub(indexFromEvent(event));
		updateHover(event);
	}

	function onPointerMove(event: PointerEvent) {
		updateHover(event);
		if (dragging) queueScrub(indexFromEvent(event));
	}

	function onPointerUp(event: PointerEvent) {
		// Mid-drag jumps use pre-drag positions, which drift as lazy cards
		// mount — settle exactly on the verse the tooltip promised.
		if (dragging && scrubIndex >= 0) {
			cancelAnimationFrame(scrubRaf);
			const t = ticks[scrubIndex];
			if (t) document.getElementById(`v${t.n}`)?.scrollIntoView();
		}
		dragging = false;
		scrubIndex = -1;
		const frac = railFrac(event);
		if (frac < 0 || frac > 1) hover = null;
		scheduleMeasure();
	}

	function onKeydown(event: KeyboardEvent) {
		const el = main();
		if (!el) return;
		const page = el.clientHeight * 0.9;
		const delta = {
			ArrowDown: 80,
			ArrowUp: -80,
			PageDown: page,
			PageUp: -page
		}[event.key];
		if (delta !== undefined) {
			el.scrollBy({ top: delta });
			event.preventDefault();
		} else if (event.key === 'Home') {
			el.scrollTop = 0;
			event.preventDefault();
		} else if (event.key === 'End') {
			el.scrollTop = el.scrollHeight;
			event.preventDefault();
		}
	}
</script>

<div bind:this={root} class="pointer-events-none sticky top-0 z-10 hidden h-0 md:block">
	{#if scrollable && railH >= 48}
		<div
			class="group pointer-events-auto absolute right-1.5 w-7 touch-none"
			style="top: {railTop}px; height: {railH}px"
			role="scrollbar"
			aria-controls="main-content"
			aria-orientation="vertical"
			aria-label={m.minimap_label()}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={valuenow}
			tabindex="0"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			onpointerleave={() => {
				if (!dragging) hover = null;
			}}
			onkeydown={onKeydown}
		>
			{#each ticks as t, i (t.n)}
				<!-- Ticks inside the viewport render darker — that band IS the
				     scroll indicator; no overlay thumb needed. -->
				<div
					class="absolute right-0 h-[1.5px] origin-right rounded-full transition-[background-color,transform] duration-150 ease-out
						{hover?.n === t.n
						? 'bg-ink'
						: t.frac >= view.top && t.frac < view.top + view.height
							? 'bg-muted'
							: 'bg-faint/40'}"
					style="top: {tickY(i)}px; width: {TICK_W}px; transform: scaleX({bump(tickY(i))})"
				></div>
			{/each}
			{#if playingY !== null}
				<div
					class="bg-accent absolute right-0 h-[2px] w-5 rounded-full"
					style="top: {playingY}px"
				></div>
			{/if}
			{#if hover}
				<div
					class="bg-surface border-edge text-body pointer-events-none absolute right-full mr-2 -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[11px] font-medium tabular-nums shadow-sm"
					style="top: {hover.y}px"
				>
					{surah}:{hover.n}
				</div>
			{/if}
		</div>
	{/if}
</div>
