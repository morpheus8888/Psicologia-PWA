import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Trans, createMessage } from '@/lib/i18n'
import ProfileMenu from '@/components/profile-menu'
import { useAuth } from '@/lib/auth-context'

const Appbar = () => {
       const router = useRouter()
       const { user } = useAuth()

	const links = useMemo(() => {
		const base = [
			{ href: '/story', label: createMessage('Story') },
			{ href: '/recipes', label: createMessage('Recipes') },
		]

		if (user?.role === 'ADMIN' || user?.isAdmin) {
			base.push({ href: '/admin', label: createMessage('Admin Panel') })
		}

		return base
	}, [user?.role, user?.isAdmin])

	return (
               <div className='fixed top-0 left-0 z-[200] w-full bg-zinc-900 pt-safe'>
			<header className='border-b bg-zinc-100 px-safe dark:border-zinc-800 dark:bg-zinc-900'>
				<div className='mx-auto flex h-20 max-w-screen-md items-center justify-between px-6'>
					<Link href='/'>
						<h1 className='font-medium'>
							<Trans id='Blog' />
						</h1>
					</Link>

					<nav className='flex items-center space-x-6'>
						<div className='hidden sm:block'>
							<div className='flex items-center space-x-6'>
					{links.map(({ label, href }) => (
						<Link
							key={href}
							href={href}
                                                                               className={`text-sm ${
                                                                               router.pathname === href
                                                                               ? 'text-indigo-500 dark:text-indigo-400'
                                                                               : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                                                                               }`}
                                                                        >
								<Trans id={label.id} />
                                                                        </Link>
                                                                ))}
                                                        </div>
                                                </div>

                                               <ProfileMenu />
					</nav>
				</div>
			</header>
		</div>
	)
}

export default Appbar
