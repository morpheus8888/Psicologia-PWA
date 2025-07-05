import Page from '@/components/page'
import Section from '@/components/section'
import { Trans } from '@lingui/react'

const Story = () => (
	<Page>
		<Section>
                        <h2 className='text-xl font-semibold'>
                                <Trans id='Story' />
                        </h2>

			<div className='mt-2'>
                                <p className='text-zinc-600 dark:text-zinc-400'>
                                        <Trans id="I confess that when this all started, you were like a picture out of focus to me. And it took time for my eyes to adjust to you, to make sense of you, to really recognize you." />
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
