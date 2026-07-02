type Callback = (visible: boolean) => void;

const callbacks = new WeakMap<Element, Callback>();
const paneObservers = new WeakMap<Element, IntersectionObserver>();
let windowObserver: IntersectionObserver | null = null;

const LOOKAHEAD_MARGIN = '200% 0px 200% 0px';

function createObserver(root: Element | null): IntersectionObserver {
	return new IntersectionObserver(
		(entries) => {
			for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting);
		},
		{ root, rootMargin: LOOKAHEAD_MARGIN }
	);
}

// rootMargin only expands the root's own box, so lookahead inside a
// scrollable pane requires that pane as the root — not the window.
function observerFor(node: Element): IntersectionObserver {
	const pane = node.closest('[data-pane]');
	if (!pane) return (windowObserver ??= createObserver(null));
	let observer = paneObservers.get(pane);
	if (!observer) {
		observer = createObserver(pane);
		paneObservers.set(pane, observer);
	}
	return observer;
}

export function lazyObserve(node: Element, callback: Callback): () => void {
	const observer = observerFor(node);
	callbacks.set(node, callback);
	observer.observe(node);
	return () => {
		observer.unobserve(node);
		callbacks.delete(node);
	};
}
