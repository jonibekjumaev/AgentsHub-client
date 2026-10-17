import type { AppProps } from 'next/app';
import { CssBaseline } from '@mui/material';
import { appWithTranslation } from 'next-i18next';

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<>
			<CssBaseline />
			<Component {...pageProps} />
		</>
	);
};

export default appWithTranslation(App);
