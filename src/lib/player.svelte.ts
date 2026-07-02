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
	#playToken = 0;

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

	/**
	 * Plays a verse from its first word. Default stops at the end of the
	 * ayah; `continuous` keeps reciting through the surah; `words` plays only
	 * that word range (selection).
	 */
	async play(
		surah: number,
		verse: number,
		opts?: { words?: { from: number; to: number }; continuous?: boolean }
	) {
		if (!browser) return;
		const audio = this.#ensure();
		// Stop whatever is sounding right away — otherwise the old position
		// keeps playing audibly until the seek below completes.
		audio.pause();
		const token = ++this.#playToken;
		try {
			const key = `${app.prefs.reciter}:${surah}`;
			if (this.#loadedKey !== key) {
				this.#timings = await getTimings(app.prefs.reciter, surah);
				if (token !== this.#playToken) return;
				audio.src = this.#timings.audioUrl;
				this.#loadedKey = key;
				await new Promise<void>((resolve) => {
					if (audio.readyState >= 1) resolve();
					else audio.addEventListener('loadedmetadata', () => resolve(), { once: true });
				});
				if (token !== this.#playToken) return;
			}
			const timing = this.#timings?.verses[verse - 1];
			if (!timing) return;
			// QDC verse windows (timestamp_from/to) bleed into neighboring
			// verses; the word segments are precise, so start at the first
			// word and stop after the last one.
			const firstSeg = timing.segments[0];
			const lastSeg = timing.segments[timing.segments.length - 1];
			let startMs = firstSeg ? firstSeg[1] : timing.from;
			this.#stopAt = opts?.continuous ? null : lastSeg ? lastSeg[2] : timing.to;
			this.rangeActive = false;
			if (opts?.words) {
				const segments = timing.segments.filter(
					(s) => s[0] >= opts.words!.from && s[0] <= opts.words!.to
				);
				if (segments.length) {
					startMs = segments[0][1];
					this.#stopAt = segments[segments.length - 1][2];
					this.rangeActive = true;
				}
			}
			this.current = { surah, verse };
			audio.currentTime = startMs / 1000;
			// Only start output once the seek has actually landed.
			if (audio.seeking) {
				await new Promise<void>((resolve) =>
					audio.addEventListener('seeked', () => resolve(), { once: true })
				);
				if (token !== this.#playToken) return;
			}
			await audio.play();
		} catch {
			if (token === this.#playToken) {
				this.current = null;
				this.#loadedKey = '';
			}
		}
	}

	/**
	 * Verse play button: pause if this verse is playing (whole-ayah or
	 * continuous); otherwise ALWAYS restart just this ayah from its beginning
	 * — no mid-verse resume, and a running selection playback is taken over.
	 */
	toggle(surah: number, verse: number) {
		if (!browser) return;
		const isCurrent = this.current?.surah === surah && this.current.verse === verse;
		if (this.playing && isCurrent && !this.rangeActive) {
			this.#ensure().pause();
			return;
		}
		void this.play(surah, verse);
	}

	#tick = () => {
		const audio = this.#audio;
		if (!audio || !this.#timings || !this.current) return;
		// While a seek is pending, currentTime still reports the old position —
		// acting on it would flash the previously played verse (and scroll to it).
		if (audio.seeking) {
			if (this.playing) this.#raf = requestAnimationFrame(this.#tick);
			return;
		}
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
