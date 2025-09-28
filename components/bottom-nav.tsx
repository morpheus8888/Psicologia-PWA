import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useLingui, createMessage } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-context'

const baseLinks = [
	{
		label: createMessage('Home'),
		href: '/',
                icon: (
			<svg
				viewBox='0 0 15 15'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				width='18'
				height='18'
			>
				<path
					d='M7.5.5l.325-.38a.5.5 0 00-.65 0L7.5.5zm-7 6l-.325-.38L0 6.27v.23h.5zm5 8v.5a.5.5 0 00.5-.5h-.5zm4 0H9a.5.5 0 00.5.5v-.5zm5-8h.5v-.23l-.175-.15-.325.38zM1.5 15h4v-1h-4v1zm13.325-8.88l-7-6-.65.76 7 6 .65-.76zm-7.65-6l-7 6 .65.76 7-6-.65-.76zM6 14.5v-3H5v3h1zm3-3v3h1v-3H9zm.5 3.5h4v-1h-4v1zm5.5-1.5v-7h-1v7h1zm-15-7v7h1v-7H0zM7.5 10A1.5 1.5 0 019 11.5h1A2.5 2.5 0 007.5 9v1zm0-1A2.5 2.5 0 005 11.5h1A1.5 1.5 0 017.5 10V9zm6 6a1.5 1.5 0 001.5-1.5h-1a.5.5 0 01-.5.5v1zm-12-1a.5.5 0 01-.5-.5H0A1.5 1.5 0 001.5 15v-1z'
					fill='currentColor'
				/>
			</svg>
		),
        },
	{
		label: createMessage('Story'),
		href: '/story',
                icon: (
			<svg
				viewBox='0 0 15 15'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				width='18'
				height='18'
			>
				<path
					d='M2.5.5V0H2v.5h.5zm10 0h.5V0h-.5v.5zM4.947 4.724a.5.5 0 00-.894-.448l.894.448zM2.5 8.494l-.447-.223-.146.293.21.251.383-.32zm5 5.997l-.384.32a.5.5 0 00.769 0l-.385-.32zm5-5.996l.384.32.21-.251-.146-.293-.447.224zm-1.553-4.219a.5.5 0 00-.894.448l.894-.448zM8 9.494v-.5H7v.5h1zm-.5-4.497A4.498 4.498 0 013 .5H2a5.498 5.498 0 005.5 5.497v-1zM2.5 1h10V0h-10v1zM12 .5a4.498 4.498 0 01-4.5 4.497v1c3.038 0 5.5-2.46 5.5-5.497h-1zM4.053 4.276l-2 3.995.895.448 2-3.995-.895-.448zM2.116 8.815l5 5.996.769-.64-5-5.996-.769.64zm5.768 5.996l5-5.996-.768-.64-5 5.996.769.64zm5.064-6.54l-2-3.995-.895.448 2 3.995.895-.448zM8 14.49V9.494H7v4.997h1z'
					fill='currentColor'
				/>
			</svg>
		),
        },
	{
		label: createMessage('Recipes'),
		href: '/recipes',
                icon: (
			<svg
				viewBox='0 0 15 15'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				width='18'
				height='18'
			>
				<path
					d='M7.5 15V7m0 .5v3m0-3a4 4 0 00-4-4h-3v3a4 4 0 004 4h3m0-3h3a4 4 0 004-4v-3h-3a4 4 0 00-4 4v3zm0 0l4-4m-4 7l-4-4'
					stroke='currentColor'
				/>
			</svg>
		),
	},
]

const adminLink = {
	label: createMessage('Admin Panel'),
        href: '/admin',
        icon: (
		<svg
			viewBox='0 0 15 15'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			width='18'
			height='18'
		>
			<path
				d='M7.5 1.5a1 1 0 011 1v1.086a4.5 4.5 0 013 4.242V11.5l1.276 1.702A.5.5 0 0112.342 14H2.658a.5.5 0 01-.434-.798L3.5 11.5V7.828a4.5 4.5 0 013-4.242V2.5a1 1 0 011-1h0z'
				stroke='currentColor'
			/>
			<path d='M5.5 14v-2a2 2 0 012-2h0a2 2 0 012 2v2' stroke='currentColor' />
		</svg>
	),
}

const BottomNav = () => {
	const router = useRouter()
	const { user } = useAuth()
        const { i18n } = useLingui()

	const links = useMemo(() => {
		const isAdmin = user?.role === 'ADMIN' || user?.isAdmin
		return isAdmin ? [...baseLinks, adminLink] : baseLinks
	}, [user?.role, user?.isAdmin])

	return (
		<div className='sm:hidden'>
			<nav className='fixed bottom-0 w-full border-t bg-zinc-100 pb-safe dark:border-zinc-800 dark:bg-zinc-900'>
				<div className='mx-auto flex h-16 max-w-md items-center justify-around px-6'>
				{links.map(({ href, label, icon }) => (
					<Link
						key={href}
						href={href}
                                                        className={`flex h-full w-full flex-col items-center justify-center space-y-1 ${
                                                                router.pathname === href
									? 'text-indigo-500 dark:text-indigo-400'
									: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
							}`}
						>
							{icon}
						<span className='text-xs text-zinc-600 dark:text-zinc-400'>{i18n._(label)}</span>
					</Link>
				))}
				</div>
			</nav>
		</div>
	)
}

export default BottomNav
