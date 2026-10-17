import { Html, Head, Main, NextScript, DocumentContext, DocumentProps } from 'next/document';
import { DocumentHeadTags, DocumentHeadTagsProps, documentGetInitialProps } from '@mui/material-nextjs/v14-pagesRouter';

type Props = DocumentProps & DocumentHeadTagsProps;

export default function Document(props: Props) {
	return (
		<Html lang={props.locale ?? 'en'}>
			<Head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<DocumentHeadTags {...props} />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

Document.getInitialProps = async (ctx: DocumentContext) => documentGetInitialProps(ctx);
