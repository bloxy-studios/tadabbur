/**
 * Recitation audio streams from everyayah.com per-verse MP3s — the one
 * runtime CDN dependency (audio is far too large to bundle like the text).
 * URL scheme: /data/{dir}/{surah:3digits}{ayah:3digits}.mp3
 */

export type ReciterId = 'alafasy' | 'husary' | 'abdulbasit' | 'minshawy' | 'maher';

export const reciters: { id: ReciterId; name: string; note: string; dir: string }[] = [
	{ id: 'alafasy', name: 'Mishary Rashid Alafasy', note: 'murattal', dir: 'Alafasy_128kbps' },
	{
		id: 'husary',
		name: 'Mahmoud Khalil Al-Husary',
		note: 'murattal, tajwid teacher',
		dir: 'Husary_128kbps'
	},
	{
		id: 'abdulbasit',
		name: 'Abdul Basit Abdus Samad',
		note: 'murattal',
		dir: 'Abdul_Basit_Murattal_192kbps'
	},
	{
		id: 'minshawy',
		name: 'Mohamed Siddiq El-Minshawy',
		note: 'murattal',
		dir: 'Minshawy_Murattal_128kbps'
	},
	{ id: 'maher', name: 'Maher Al-Muaiqly', note: 'murattal', dir: 'MaherAlMuaiqly128kbps' }
];

export function verseAudioUrl(reciter: ReciterId, surah: number, ayah: number): string {
	const dir = reciters.find((r) => r.id === reciter)?.dir ?? reciters[0].dir;
	const pad = (n: number) => String(n).padStart(3, '0');
	return `https://everyayah.com/data/${dir}/${pad(surah)}${pad(ayah)}.mp3`;
}
