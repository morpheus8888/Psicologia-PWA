import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import '@/styles/globals.css'
import '@/styles/login.css'
import '@/styles/nickname-selector.css'
import { LocalizationProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth-context'

export default function App({ Component, pageProps }: AppProps) {
        return (
                <AuthProvider>
                        <LocalizationProvider>
                                <ThemeProvider
                                        attribute='class'
                                        defaultTheme='system'
                                        disableTransitionOnChange
                                >
                                        <Component {...pageProps} />
                                </ThemeProvider>
                        </LocalizationProvider>
                </AuthProvider>
        )
}
