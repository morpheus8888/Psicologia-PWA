import { useEffect, useState } from 'react'
import Page from '@/components/page'
import Avatar, { AvatarType } from '@/components/avatar'
import { useRouter } from 'next/router'

interface Profile {
	email: string
	name: string | null
	description: string | null
	avatar: AvatarType
	color: string
}

export default function EditProfile() {
	const [profile, setProfile] = useState<Profile | null>(null)
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [avatar, setAvatar] = useState<AvatarType>('cat')
	const router = useRouter()

	useEffect(() => {
		fetch('/api/user/me', { credentials: 'include' })
			.then((r) => r.json())
			.then((data) => {
				setProfile(data)
				setName(data.name || '')
				setDescription(data.description || '')
				setAvatar(data.avatar as AvatarType)
			})
	}, [])

	const saveProfile = async (e: React.FormEvent) => {
		e.preventDefault()
		await fetch('/api/user/update', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ name, description, avatar }),
		})
		router.push('/profile')
	}

	const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const form = e.currentTarget
		const oldPassword = (form.elements.namedItem('old') as HTMLInputElement)
			.value
		const newPassword = (form.elements.namedItem('new') as HTMLInputElement)
			.value
		await fetch('/api/user/change-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ oldPassword, newPassword }),
		})
		form.reset()
	}

	if (!profile) return <Page title='Profile'></Page>

	return (
		<Page title='Profile'>
			<div className='max-w-xl mx-auto space-y-6 p-4'>
				<form onSubmit={saveProfile} className='space-y-4'>
					<div className='flex justify-center'>
						<div
							className='h-24 w-24 rounded-full overflow-hidden flex items-center justify-center'
							style={{ backgroundColor: profile.color }}
						>
							<Avatar type={avatar} />
						</div>
					</div>
					<div className='flex space-x-4 justify-center'>
						<label>
							<input
								type='radio'
								name='avatar'
								value='cat'
								checked={avatar === 'cat'}
								onChange={() => setAvatar('cat')}
							/>{' '}
							Cat
						</label>
						<label>
							<input
								type='radio'
								name='avatar'
								value='dog'
								checked={avatar === 'dog'}
								onChange={() => setAvatar('dog')}
							/>{' '}
							Dog
						</label>
					</div>
					<div>
						<label className='block text-sm'>Name</label>
						<input
							className='w-full border p-2'
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div>
						<label className='block text-sm'>Email</label>
						<input
							className='w-full border p-2 bg-zinc-100'
							value={profile.email}
							readOnly
						/>
					</div>
					<div>
						<label className='block text-sm'>Description</label>
						<textarea
							className='w-full border p-2'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<button
						type='submit'
						className='px-4 py-2 bg-indigo-500 text-white rounded'
					>
						Save
					</button>
				</form>
				<form onSubmit={changePassword} className='space-y-2'>
					<h3 className='text-lg font-medium'>Change password</h3>
					<input
						type='password'
						name='old'
						placeholder='Old password'
						className='w-full border p-2'
					/>
					<input
						type='password'
						name='new'
						placeholder='New password'
						className='w-full border p-2'
					/>
					<button
						type='submit'
						className='px-4 py-2 bg-indigo-500 text-white rounded'
					>
						Change
					</button>
				</form>
			</div>
		</Page>
	)
}
