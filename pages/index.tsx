import Page from '@/components/page'
import Section from '@/components/section'
import { Trans } from '@lingui/react'

const Index = () => (
	<Page>
		<Section>
                        <h2 className='text-xl font-semibold text-zinc-800 dark:text-zinc-200'>
                                <Trans id='We grow a lot of rice.' />
                        </h2>

			<div className='mt-2'>
                                <p className='text-zinc-600 dark:text-zinc-400'>
                                        <Trans
                                                id='You love rice, and so does the rest of the world. In the crop year 2008/2009, the milled rice production volume amounted to over <0>448 million tons</0> worldwide.'
                                                components={[
                                                        <span key='b' className='font-medium text-zinc-900 dark:text-zinc-50' />,
                                                ]}
                                        />
                                </p>

				<br />

				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
                                        <a
                                                href='https://github.com/mvllow/next-pwa-template'
                                                className='underline'
                                        >
                                                <Trans id='Source' />
                                        </a>
				</p>
			</div>
		</Section>
	</Page>
)

export default Index
