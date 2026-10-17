import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import { appWithTranslation } from 'next-i18next';
import { useApollo } from '@/apollo/client';
import { AuthProvider } from '@/auth';
import { theme } from '@/theme/theme';
import { fontVars } from '@/theme/tokens';
import { jetbrainsMono, manrope, notoSansKr } from '@/theme/fonts';

// Font CSS variables live on :root so portals (menus, dialogs) inherit them too.
const fontVariables = (
	<GlobalStyles
		styles={{
			':root': {
				[fontVars.sans]: manrope.style.fontFamily,
				[fontVars.mono]: jetbrainsMono.style.fontFamily,
				[fontVars.korean]: notoSansKr.style.fontFamily,
			},
		}}
	/>
);

const App = (props: AppProps) => {
	const { Component, pageProps } = props;
	const apolloClient = useApollo(pageProps);

	return (
		<AppCacheProvider {...props}>
			<ApolloProvider client={apolloClient}>
				<AuthProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						{fontVariables}
						<Component {...pageProps} />
					</ThemeProvider>
				</AuthProvider>
			</ApolloProvider>
		</AppCacheProvider>
	);
};

export default appWithTranslation(App);
