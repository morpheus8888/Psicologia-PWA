import Page from '@/components/page'
import Section from '@/components/section'
import { Trans } from '@/lib/i18n'

const Story = () => (
	<Page>
		<Section>
                        <h2 className='text-xl font-semibold'>
                                <Trans id='Story' />
                        </h2>

			<div className='mt-2'>
                                <p className='text-zinc-600 dark:text-zinc-400'>
                                        <Trans id="Recipes" />
                                </p>

				<br />

                                <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                                        <Trans
                                                id='<0>Vision</0>, a two sentence story'
                                                components={[
                                                        <a key='v' href='https://twosentencestories.com/vision' className='underline' />,
                                                ]}
                                        />
                                </p>
			</div>
		</Section>
	</Page>
)

export default Story
