import Head from 'next/head'
import Appbar from '@/components/appbar'
import BottomNav from '@/components/bottom-nav'
import { useLingui } from '@lingui/react'

interface Props {
	title?: string
	children: React.ReactNode
}

const Page = ({ title, children }: Props) => {
        const { i18n } = useLingui()

        const baseTitle = i18n._('Rice Bowl')
        const pageTitle = title ? `${title} – ${baseTitle}` : baseTitle

        return (
                <>
                        <Head>
                                <title>{pageTitle}</title>
                        </Head>

		<Appbar />

		<main
			/**
			 * Padding top = `appbar` height
			 * Padding bottom = `bottom-nav` height
			 */
			className='mx-auto max-w-screen-md pt-20 pb-16 px-safe sm:pb-0'
		>
			<div className='p-6'>{children}</div>
		</main>

                <BottomNav />
                </>
        )
}

export default Page
