<script lang="ts">
	import { app } from '$lib/app-state.svelte';
</script>

<div class="flex flex-col gap-6 px-4 pb-6">
	<fieldset>
		<legend class="text-xs font-semibold tracking-wide text-stone-400 uppercase"
			>Translations</legend
		>
		<label class="mt-2 flex items-center gap-2.5 text-sm text-stone-700">
			<input
				type="checkbox"
				class="rounded border-stone-300 text-accent focus:ring-accent"
				bind:checked={app.prefs.showEn}
				onchange={() => app.persistPrefs()}
			/>
			English — Saheeh International
		</label>
		<label class="mt-2 flex items-center gap-2.5 text-sm text-stone-700">
			<input
				type="checkbox"
				class="rounded border-stone-300 text-accent focus:ring-accent"
				bind:checked={app.prefs.showId}
				onchange={() => app.persistPrefs()}
			/>
			Indonesia — Kemenag
		</label>
	</fieldset>

	<fieldset>
		<legend class="text-xs font-semibold tracking-wide text-stone-400 uppercase">Tafsir</legend>
		<label class="mt-2 flex items-center gap-2.5 text-sm text-stone-700">
			<input
				type="radio"
				name="tafsir-lang"
				value="en"
				class="border-stone-300 text-accent focus:ring-accent"
				bind:group={app.prefs.tafsirLang}
				onchange={() => app.persistPrefs()}
			/>
			English — Ibn Kathir (Abridged)
		</label>
		<label class="mt-2 flex items-center gap-2.5 text-sm text-stone-700">
			<input
				type="radio"
				name="tafsir-lang"
				value="id"
				class="border-stone-300 text-accent focus:ring-accent"
				bind:group={app.prefs.tafsirLang}
				onchange={() => app.persistPrefs()}
			/>
			Indonesia — Tafsir Kemenag
		</label>
	</fieldset>

	<fieldset>
		<legend class="text-xs font-semibold tracking-wide text-stone-400 uppercase">
			Arabic text size
		</legend>
		<input
			type="range"
			min="1.5"
			max="3"
			step="0.25"
			class="mt-3 w-full accent-emerald-700"
			bind:value={app.prefs.arabicSize}
			onchange={() => app.persistPrefs()}
		/>
		<p
			class="font-arabic mt-2 text-center text-stone-700"
			style="font-size: {app.prefs.arabicSize}rem"
		>
			بِسْمِ ٱللَّهِ
		</p>
	</fieldset>

	<p class="text-xs leading-relaxed text-stone-400">
		Sign-in, notes and progress sync are coming soon. Your preferences are saved on this device.
	</p>
</div>
