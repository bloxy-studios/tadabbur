<script lang="ts">
	import { app, arabicFontStacks, type ArabicFont, type Theme } from '$lib/app-state.svelte';
	import { reciters } from '$lib/quran/audio';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, setLocale, type Locale } from '$lib/paraglide/runtime';
	import Segmented from './Segmented.svelte';

	const fontOptions: { value: ArabicFont; label: string }[] = [
		{ value: 'amiri', label: 'Amiri Quran' },
		{ value: 'scheherazade', label: 'Scheherazade New' },
		{ value: 'noto', label: 'Noto Naskh Arabic' }
	];

	function setPref<K extends 'theme' | 'arabicFont'>(key: K, value: (typeof app.prefs)[K]) {
		app.prefs[key] = value;
		app.persistPrefs();
	}
</script>

<div class="flex min-h-0 grow flex-col gap-6 overflow-y-auto px-4 pb-6">
	<section>
		<h3 class="text-faint mb-2 text-xs font-semibold tracking-wide uppercase">
			{m.settings_language()}
		</h3>
		<Segmented
			options={[
				{ value: 'en', label: 'English' },
				{ value: 'id', label: 'Indonesia' }
			]}
			value={getLocale()}
			onselect={(value) => setLocale(value as Locale)}
		/>
	</section>

	<section>
		<h3 class="text-faint mb-2 text-xs font-semibold tracking-wide uppercase">
			{m.settings_theme()}
		</h3>
		<Segmented
			options={[
				{ value: 'light', label: m.theme_light() },
				{ value: 'dark', label: m.theme_dark() },
				{ value: 'system', label: m.theme_system() }
			]}
			value={app.prefs.theme}
			onselect={(value) => setPref('theme', value as Theme)}
		/>
	</section>

	<section>
		<h3 class="text-faint mb-2 text-xs font-semibold tracking-wide uppercase">
			{m.settings_reciter()}
		</h3>
		<select
			bind:value={app.prefs.reciter}
			onchange={() => app.persistPrefs()}
			class="bg-surface text-body focus:border-accent focus:ring-accent w-full rounded-lg border-edge text-sm"
		>
			{#each reciters as reciter (reciter.id)}
				<option value={reciter.id}>{reciter.name} — {reciter.style}</option>
			{/each}
		</select>
	</section>

	<section>
		<h3 class="text-faint mb-2 text-xs font-semibold tracking-wide uppercase">
			{m.settings_arabic_font()}
		</h3>
		<div class="flex flex-col gap-2">
			{#each fontOptions as font (font.value)}
				<button
					type="button"
					class="rounded-xl border px-4 py-3 text-left transition-colors
						{app.prefs.arabicFont === font.value
						? 'border-accent bg-accent-soft'
						: 'bg-surface hover:border-faint border-edge'}"
					aria-pressed={app.prefs.arabicFont === font.value}
					onclick={() => setPref('arabicFont', font.value)}
				>
					<span
						dir="rtl"
						lang="ar"
						class="text-ink block text-2xl leading-relaxed"
						style="font-family: {arabicFontStacks[font.value]}"
					>
						بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
					</span>
					<span class="text-faint mt-1 block text-xs font-medium">{font.label}</span>
				</button>
			{/each}
		</div>
	</section>

	<section>
		<h3 class="text-faint mb-2 text-xs font-semibold tracking-wide uppercase">
			{m.settings_arabic_size()}
		</h3>
		<input
			type="range"
			min="1.5"
			max="3"
			step="0.25"
			class="accent-accent w-full"
			bind:value={app.prefs.arabicSize}
			onchange={() => app.persistPrefs()}
		/>
		<p
			dir="rtl"
			lang="ar"
			class="font-arabic text-ink mt-2 text-center"
			style="font-size: {app.prefs.arabicSize}rem"
		>
			بِسْمِ ٱللَّهِ
		</p>
	</section>

	<p class="text-faint text-xs leading-relaxed">{m.settings_note()}</p>
</div>
