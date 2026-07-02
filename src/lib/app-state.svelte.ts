import { browser } from '$app/environment';
import type { ReciterId } from './quran/audio';

export type SidebarView = 'surahs' | 'search' | 'notes' | 'settings';
export type Theme = 'light' | 'dark' | 'system';
export type ArabicFont = 'amiri' | 'scheherazade' | 'noto';

export const arabicFontStacks: Record<ArabicFont, string> = {
	amiri: "'Amiri Quran'",
	scheherazade: "'Scheherazade New'",
	noto: "'Noto Naskh Arabic'"
};

export interface LastRead {
	surah: number;
	verse: number;
}

const STORAGE_KEY = 'tadabbur:prefs';
const LAST_READ_KEY = 'tadabbur:last-read';

interface Prefs {
	theme: Theme;
	arabicFont: ArabicFont;
	arabicSize: number; // rem
	focusMode: boolean;
	sidebarOpen: boolean;
	infoOpen: boolean;
	reciter: ReciterId;
}

const defaults: Prefs = {
	theme: 'system',
	arabicFont: 'amiri',
	arabicSize: 2,
	focusMode: false,
	sidebarOpen: true,
	infoOpen: true,
	reciter: 7
};

function loadJson<T>(key: string, fallback: T): T {
	if (!browser) return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
	} catch {
		return fallback;
	}
}

function loadPrefs(): Prefs {
	const prefs = loadJson(STORAGE_KEY, defaults);
	// Reciter ids moved from everyayah slugs (strings) to QDC ids (numbers).
	if (typeof prefs.reciter !== 'number') prefs.reciter = defaults.reciter;
	return prefs;
}

class AppState {
	view: SidebarView = $state('surahs');
	prefs: Prefs = $state(loadPrefs());
	lastRead: LastRead | null = $state(loadJson<LastRead | null>(LAST_READ_KEY, null));
	/** Mobile drawer visibility — session-only, never persisted. */
	mobileSidebarOpen = $state(false);

	persistPrefs() {
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
	}

	setLastRead(surah: number, verse: number) {
		this.lastRead = { surah, verse };
		if (browser) localStorage.setItem(LAST_READ_KEY, JSON.stringify(this.lastRead));
	}

	/**
	 * Activity bar / shortcut behavior: switching views opens the sidebar,
	 * re-activating the current view (or no view) toggles it. Desktop state is
	 * persisted; the mobile drawer is per-session.
	 */
	toggleSidebar(view?: SidebarView) {
		const mobile = browser && window.matchMedia('(max-width: 767px)').matches;
		const isOpen = mobile ? this.mobileSidebarOpen : this.prefs.sidebarOpen;
		const open = view && (view !== this.view || !isOpen) ? true : !isOpen;
		if (view) this.view = view;
		if (mobile) this.mobileSidebarOpen = open;
		else {
			this.prefs.sidebarOpen = open;
			this.persistPrefs();
		}
	}

	closeMobileSidebar() {
		this.mobileSidebarOpen = false;
	}
}

export const app = new AppState();
