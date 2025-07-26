import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import '@/styles/globals.css'
import '@/styles/login.css'
import '@/styles/avatars.css'
import { LocalizationProvider } from '@/lib/i18n'

export default function App({ Component, pageProps }: AppProps) {
        return (
                <LocalizationProvider>
                        <ThemeProvider
                                attribute='class'
                                defaultTheme='system'
                                disableTransitionOnChange
                        >
                                <Component {...pageProps} />
                        </ThemeProvider>
                </LocalizationProvider>
        )
}
