import Page from '@/components/page'
import Section from '@/components/section'
import { Trans } from '@lingui/react'

const Profile = () => (
  <Page title='Profile'>
    <Section>
      <h2 className='text-xl font-semibold'>
        <Trans id='My profile' />
      </h2>
    </Section>
  </Page>
)

export default Profile
