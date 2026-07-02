export interface Chapter {
	number: number;
	nameArabic: string;
	nameSimple: string;
	nameEn: string;
	nameId: string;
	revelationPlace: 'makkah' | 'madinah';
	revelationOrder: number;
	bismillahPre: boolean;
	versesCount: number;
	pages: [number, number];
}

export interface Word {
	a: string;
	en: string;
	id: string;
}

export interface Verse {
	n: number;
	key: string;
	arabic: string;
	page: number;
	juz: number;
	en: string;
	id: string;
	words: Word[];
}

export interface SurahData {
	surah: number;
	verses: Verse[];
}

export interface TafsirEntry {
	from: number;
	to: number;
	text: string;
}

export interface TafsirData {
	surah: number;
	source: string;
	entries: TafsirEntry[];
}

export type TranslationLang = 'en' | 'id';

export type TafsirSlug = 'ibn-kathir' | 'kemenag' | 'mukhtasar';
