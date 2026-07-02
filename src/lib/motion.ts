import { browser } from '$app/environment';

const reduceMotion = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Transition duration that collapses to 0 for prefers-reduced-motion. */
export function dur(ms: number): number {
	return reduceMotion ? 0 : ms;
}
