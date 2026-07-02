import { browser } from '$app/environment';
import { app } from './app-state.svelte';
import { verseAudioUrl } from './quran/audio';

/** One shared audio element for the whole app — playing a verse stops the previous one. */
class Player {
	current: { surah: number; verse: number } | null = $state(null);
	playing = $state(false);
	#audio: HTMLAudioElement | null = null;

	#ensure(): HTMLAudioElement {
		if (!this.#audio) {
			this.#audio = new Audio();
			this.#audio.addEventListener('play', () => (this.playing = true));
			this.#audio.addEventListener('pause', () => (this.playing = false));
			this.#audio.addEventListener('ended', () => {
				this.playing = false;
				this.current = null;
			});
			this.#audio.addEventListener('error', () => {
				this.playing = false;
				this.current = null;
			});
		}
		return this.#audio;
	}

	toggle(surah: number, verse: number) {
		if (!browser) return;
		const audio = this.#ensure();
		if (this.current?.surah === surah && this.current.verse === verse) {
			if (audio.paused) void audio.play().catch(() => (this.current = null));
			else audio.pause();
			return;
		}
		this.current = { surah, verse };
		audio.src = verseAudioUrl(app.prefs.reciter, surah, verse);
		void audio.play().catch(() => (this.current = null));
	}
}

export const player = new Player();
