import { browser } from '$app/environment';
import { app } from './app-state.svelte';
import { getTimings, type SurahTimings } from './quran/timings';

/**
 * One shared gapless-audio player. Playback continues through the surah
 * (follow-along), `currentWord` tracks the word being recited for the
 * karaoke highlight, and a word range can be played on its own.
 */
class Player {
	current: { surah: number; verse: number } | null = $state(null);
	currentWord: number | null = $state(null);
	playing = $state(false);
	/** True while a selected word range (not the whole verse) is playing. */
	rangeActive = $state(false);

	#audio: HTMLAudioElement | null = null;
	#timings: SurahTimings | null = null;
	#loadedKey = '';
	#stopAt: number | null = null;
	#raf = 0;

	#ensure(): HTMLAudioElement {
		if (!this.#audio) {
			this.#audio = new Audio();
			this.#audio.addEventListener('play', () => {
				this.playing = true;
				this.#raf = requestAnimationFrame(this.#tick);
			});
			this.#audio.addEventListener('pause', () => {
				this.playing = false;
				this.currentWord = null;
				cancelAnimationFrame(this.#raf);
			});
			this.#audio.addEventListener('ended', () => {
				this.playing = false;
				this.current = null;
				this.currentWord = null;
				this.rangeActive = false;
				cancelAnimationFrame(this.#raf);
			});
			this.#audio.addEventListener('error', () => {
				this.playing = false;
				this.current = null;
				this.currentWord = null;
				this.rangeActive = false;
			});
		}
		return this.#audio;
	}

	async play(surah: number, verse: number, words?: { from: number; to: number }) {
		if (!browser) return;
		const audio = this.#ensure();
		try {
			const key = `${app.prefs.reciter}:${surah}`;
			if (this.#loadedKey !== key) {
				this.#timings = await getTimings(app.prefs.reciter, surah);
				audio.src = this.#timings.audioUrl;
				this.#loadedKey = key;
			}
			const timing = this.#timings?.verses[verse - 1];
			if (!timing) return;
			let startMs = timing.from;
			this.#stopAt = null;
			if (words) {
				const segments = timing.segments.filter((s) => s[0] >= words.from && s[0] <= words.to);
				if (segments.length) {
					startMs = segments[0][1];
					this.#stopAt = segments[segments.length - 1][2];
				}
			}
			this.rangeActive = this.#stopAt !== null;
			this.current = { surah, verse };
			audio.currentTime = startMs / 1000;
			await audio.play();
		} catch {
			this.current = null;
			this.#loadedKey = '';
		}
	}

	/**
	 * Verse play button: pause if this whole verse is playing; otherwise
	 * ALWAYS restart the ayah from its beginning — no mid-verse resume, and a
	 * running selection (word range) playback is simply taken over.
	 */
	toggle(surah: number, verse: number) {
		if (!browser) return;
		const isCurrent = this.current?.surah === surah && this.current.verse === verse;
		if (this.playing && isCurrent && this.#stopAt === null) {
			this.#ensure().pause();
			return;
		}
		void this.play(surah, verse);
	}

	#tick = () => {
		const audio = this.#audio;
		if (!audio || !this.#timings || !this.current) return;
		const t = audio.currentTime * 1000;

		if (this.#stopAt !== null && t >= this.#stopAt) {
			this.#stopAt = null;
			this.rangeActive = false;
			audio.pause();
			return;
		}

		let timing = this.#timings.verses[this.current.verse - 1];
		if (!timing || t < timing.from || t >= timing.to) {
			const found = this.#timings.verses.find((v) => t >= v.from && t < v.to);
			if (found) {
				const verse = Number(found.key.split(':')[1]);
				if (verse !== this.current.verse) this.current = { surah: this.current.surah, verse };
				timing = found;
			}
		}
		const segment = timing?.segments.find((s) => t >= s[1] && t < s[2]);
		const word = segment ? segment[0] : null;
		if (word !== this.currentWord) this.currentWord = word;

		if (this.playing) this.#raf = requestAnimationFrame(this.#tick);
	};
}

export const player = new Player();
