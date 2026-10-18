import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import { appWithTranslation } from 'next-i18next';
import { useApollo } from '@/apollo/client';
import { AuthProvider } from '@/auth';
import type { GetLayout, NextPageWithLayout } from '@/shared/layout/types';
import { ToastProvider } from '@/shared/ui/toast'; // direct: the barrel would pull the whole UI kit into _app
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

type AppPropsWithLayout = AppProps & { Component: NextPageWithLayout };

const withoutLayout: GetLayout = (page) => page;

const App = (props: AppPropsWithLayout) => {
	const { Component, pageProps } = props;
	const apolloClient = useApollo(pageProps);
	const getLayout = Component.getLayout ?? withoutLayout;

	return (
		<AppCacheProvider {...props}>
			<ApolloProvider client={apolloClient}>
				<AuthProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						{fontVariables}
						<ToastProvider>
							{getLayout(<Component {...pageProps} />)}
						</ToastProvider>
					</ThemeProvider>
				</AuthProvider>
			</ApolloProvider>
		</AppCacheProvider>
	);
};

export default appWithTranslation(App);
