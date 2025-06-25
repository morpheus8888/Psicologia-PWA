import Link from 'next/link'
import { useRouter } from 'next/router'
import { useLingui, Trans } from '@lingui/react'
import { locales } from '@/lib/i18n'

const links = [
        { id: 'Story', href: '/story' },
        { id: 'Recipes', href: '/recipes' },
]

const Appbar = () => {
        const router = useRouter()
        const { i18n } = useLingui()

	return (
		<div className='fixed top-0 left-0 z-20 w-full bg-zinc-900 pt-safe'>
			<header className='border-b bg-zinc-100 px-safe dark:border-zinc-800 dark:bg-zinc-900'>
				<div className='mx-auto flex h-20 max-w-screen-md items-center justify-between px-6'>
                                        <Link href='/'>
                                                <h1 className='font-medium'>
                                                        <Trans id='Rice Bowl' />
                                                </h1>
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

                                                <select
                                                        value={router.locale}
                                                        onChange={(e) => router.push(router.pathname, router.asPath, { locale: e.target.value })}
                                                        className='rounded border bg-transparent p-1 text-sm dark:border-zinc-600'
                                                >
                                                        {Object.entries(locales).map(([loc, { label }]) => (
                                                                <option key={loc} value={loc}>
                                                                        {label}
                                                                </option>
                                                        ))}
                                                </select>

                                                <div
                                                        title={i18n._('Gluten Free')}
                                                        className='h-10 w-10 rounded-full bg-zinc-200 bg-cover bg-center shadow-inner dark:bg-zinc-800'
                                                        style={{
                                                                backgroundImage:
									'url(https://images.unsplash.com/photo-1612480797665-c96d261eae09?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80)',
							}}
						/>
					</nav>
				</div>
			</header>
		</div>
	)
}

export default Appbar
