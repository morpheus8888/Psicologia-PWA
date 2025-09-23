import type { GetServerSideProps } from 'next'
import sanitizeHtml from 'sanitize-html'
import { Trans } from '@lingui/react'

import Page from '@/components/page'
import Section from '@/components/section'
import { prisma } from '@/lib/prisma'

type BlogPostProps = {
  article: {
    id: string
    title: string
    content: string
    publishedAt: string
    authorEmail: string
  } | null
}

const BlogPost = ({ article }: BlogPostProps) => {
  if (!article) {
    return (
      <Page title='Article'>
        <Section>
          <div className='text-center text-zinc-500 dark:text-zinc-300'>
            <Trans id='The requested article is no longer available.' />
          </div>
        </Section>
      </Page>
    )
  }

  return (
    <Page title={article.title}>
      <Section>
        <article className='mx-auto max-w-3xl space-y-6'>
          <header className='space-y-2'>
            <p className='text-xs uppercase tracking-wide text-indigo-500 dark:text-indigo-300'>
              <Trans id='Published article' />
            </p>
            <h1 className='text-3xl font-semibold text-zinc-900 dark:text-zinc-100'>{article.title}</h1>
            <div className='flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400'>
              <span>{new Date(article.publishedAt).toLocaleString()}</span>
              <span>{article.authorEmail}</span>
            </div>
          </header>

          <div className='prose prose-zinc max-w-none dark:prose-invert' dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>
      </Section>
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps<BlogPostProps> = async ({ params }) => {
  const slug = params?.slug as string | undefined
  if (!slug) {
    return { notFound: true }
  }

  const article = await prisma.article.findFirst({
    where: {
      slug,
      publishedAt: { not: null },
    },
    include: {
      author: { select: { email: true } },
    },
  })

  if (!article) {
    return { notFound: true }
  }

  const safeContent = sanitizeHtml(article.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'blockquote']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt']
    },
    allowedSchemes: ['data', 'http', 'https']
  })

  return {
    props: {
      article: {
        id: article.id,
        title: article.title,
        content: safeContent,
        publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
        authorEmail: article.author.email,
      }
    }
  }
}

export default BlogPost
