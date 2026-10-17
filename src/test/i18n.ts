/// <reference types="vite/client" />
import i18next, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

// The real English files, so tests assert the text users see — not keys.
const files = import.meta.glob<Record<string, unknown>>('../../public/locales/en/*.json', {
	eager: true,
	import: 'default',
});

const en = Object.fromEntries(
	Object.entries(files).map(([path, json]) => [path.split('/').pop()!.replace('.json', ''), json]),
);

const resources: Resource = { en };

/** A fresh, synchronously initialised instance per call, so tests never share language state. */
export const createTestI18n = () => {
	const instance = i18next.createInstance();
	void instance.use(initReactI18next).init({
		lng: 'en',
		fallbackLng: 'en',
		ns: Object.keys(en),
		defaultNS: 'common',
		resources,
		initImmediate: false,
		interpolation: { escapeValue: false },
	});
	return instance;
};
