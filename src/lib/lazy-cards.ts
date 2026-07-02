/**
 * Shared IntersectionObserver for lazily mounting verse cards: content
 * renders when a card approaches the viewport and is torn back down to an
 * empty, height-preserving shell when it drifts far away. This keeps the
 * mounted DOM bounded (~30 cards) regardless of surah length.
 */

type Callback = (visible: boolean) => void;

const callbacks = new WeakMap<Element, Callback>();
let observer: IntersectionObserver | null = null;

export function lazyObserve(node: Element, callback: Callback): () => void {
	if (!observer) {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting);
			},
			// Mount well before the card scrolls in, unmount well after it leaves.
			{ rootMargin: '200% 0px 200% 0px' }
		);
	}
	callbacks.set(node, callback);
	observer.observe(node);
	return () => {
		observer?.unobserve(node);
		callbacks.delete(node);
	};
}
