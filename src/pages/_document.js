import Document, {Html, Head, Main, NextScript} from 'next/document'

class MyDocument extends Document{
    render(){
        return(
            <Html lang="en">
                <Head>
                    <meta name="description" content="NovaCart — modern e-commerce shopping with Next.js"/>
                    <link rel="icon" href="/icon.svg" type="image/svg+xml"/>
                    <link rel="icon" href="/favicon.ico" sizes="any"/>
                    <meta name="theme-color" content="#7c3aed"/>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument