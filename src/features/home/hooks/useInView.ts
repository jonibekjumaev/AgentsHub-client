import { useEffect, useRef, useState } from 'react';

/**
 * true once the element has been at least `threshold` visible (then the observer stops: run once).
 * Without IntersectionObserver (old browsers, tests) it is true right away, so nothing stays hidden.
 */
export const useInView = <T extends Element>(threshold = 0.15) => {
	const ref = useRef<T>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element || typeof IntersectionObserver === 'undefined') {
			setInView(true);
			return undefined;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [threshold]);

	return { ref, inView };
};
