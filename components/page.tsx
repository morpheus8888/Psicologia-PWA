import { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Appbar from '@/components/appbar'
import BottomNav from '@/components/bottom-nav'
import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useAuth } from '@/lib/auth-context'

interface Props {
	title?: string
	children: React.ReactNode
}

const Page = ({ title, children }: Props) => {
	const { i18n } = useLingui()
	const { unreadCount, refreshUnreadCount, isLoggedIn } = useAuth()

	useEffect(() => {
		if (isLoggedIn) {
			void refreshUnreadCount()
		}
	}, [isLoggedIn, refreshUnreadCount])

        const baseTitle = 'Blog'
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
		<div className='space-y-4 p-6'>
		{unreadCount > 0 && (
			<div className='flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700 shadow-sm dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-100'>
				<span>
				{unreadCount === 1
					? i18n._(t`You have one unread message`)
					: i18n._(t`You have {count} unread messages`, { count: unreadCount })}
				</span>
				<Link
					href='/messages'
					className='relative inline-flex items-center gap-2 rounded-full border border-indigo-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-500 transition hover:bg-indigo-500 hover:text-white'
				>
					<Trans>Open messages</Trans>
					<span className='inline-flex min-w-[1.5rem] justify-center rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white'>
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				</Link>
			</div>
		)}
			{children}
		</div>
		</main>

                <BottomNav />
                </>
        )
}

export default Page
