import '../../styles/globals.css'
import Layout from '../../components/Layout'
import { DataProvider } from '../../store/GlobalState'
import { ThemeProvider } from 'next-themes'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <DataProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </DataProvider>
    </ThemeProvider>
  )
}

export default MyApp