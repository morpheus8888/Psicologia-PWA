import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Trans } from '@lingui/react'
import ProfileMenu from '@/components/profile-menu'
import { useAuth } from '@/lib/auth-context'

const baseLinks = [
        { id: 'Story', href: '/story' },
        { id: 'Recipes', href: '/recipes' },
]

const adminLink = { id: 'Admin Panel', href: '/admin' }

const Appbar = () => {
       const router = useRouter()
       const { user } = useAuth()

       const links = useMemo(() => {
               if (user?.role === 'ADMIN' || user?.isAdmin) {
                       return [...baseLinks, adminLink]
               }
               return baseLinks
       }, [user?.role, user?.isAdmin])

	return (
               <div className='fixed top-0 left-0 z-[200] w-full bg-zinc-900 pt-safe'>
			<header className='border-b bg-zinc-100 px-safe dark:border-zinc-800 dark:bg-zinc-900'>
				<div className='mx-auto flex h-20 max-w-screen-md items-center justify-between px-6'>
                                        <Link href='/'>
                                                <h1 className='font-medium'>Blog</h1>
                                        </Link>

					<nav className='flex items-center space-x-6'>
						<div className='hidden sm:block'>
							<div className='flex items-center space-x-6'>
                                                                {links.map(({ id, href }) => (
                                                                        <Link
                                                                               key={id}
                                                                               href={href}
                                                                               className={`text-sm ${
                                                                               router.pathname === href
                                                                               ? 'text-indigo-500 dark:text-indigo-400'
                                                                               : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
                                                                               }`}
                                                                        >
                                                                               <Trans id={id} />
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
