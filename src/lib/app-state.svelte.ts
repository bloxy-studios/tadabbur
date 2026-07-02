import { browser } from '$app/environment';

export type SidebarView = 'surahs' | 'search' | 'notes' | 'settings';

export interface LastRead {
	surah: number;
	verse: number;
}

const STORAGE_KEY = 'tadabbur:prefs';
const LAST_READ_KEY = 'tadabbur:last-read';

interface Prefs {
	showEn: boolean;
	showId: boolean;
	arabicSize: number; // rem
	sidebarOpen: boolean;
	infoOpen: boolean;
	tafsirLang: 'en' | 'id';
}

const defaults: Prefs = {
	showEn: true,
	showId: true,
	arabicSize: 2,
	sidebarOpen: true,
	infoOpen: true,
	tafsirLang: 'en'
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

class AppState {
	view: SidebarView = $state('surahs');
	prefs: Prefs = $state(loadJson(STORAGE_KEY, defaults));
	lastRead: LastRead | null = $state(loadJson<LastRead | null>(LAST_READ_KEY, null));

	persistPrefs() {
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
	}

	setLastRead(surah: number, verse: number) {
		this.lastRead = { surah, verse };
		if (browser) localStorage.setItem(LAST_READ_KEY, JSON.stringify(this.lastRead));
	}

	toggleSidebar(view?: SidebarView) {
		if (view && (view !== this.view || !this.prefs.sidebarOpen)) {
			this.view = view;
			this.prefs.sidebarOpen = true;
		} else {
			this.prefs.sidebarOpen = !this.prefs.sidebarOpen;
		}
		this.persistPrefs();
	}
}

export const app = new AppState();
