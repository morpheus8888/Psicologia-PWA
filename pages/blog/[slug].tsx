import type { GetServerSideProps } from 'next'
import sanitizeHtml from 'sanitize-html'
import { Trans } from '@/lib/i18n'

import Page from '@/components/page'
import Section from '@/components/section'
import { prisma, isDatabaseConfigured } from '@/lib/prisma'

type BlogPostProps = {
  article: {
    id: string
    title: string
    content: string
    publishedAt: string
    authorEmail: string
  } | null
  databaseReady: boolean
}

const BlogPost = ({ article, databaseReady }: BlogPostProps) => {
  if (!article) {
    return (
      <Page title='Article'>
        <Section>
          <div className='mx-auto max-w-2xl space-y-4 text-center text-zinc-500 dark:text-zinc-300'>
            {!databaseReady && (
              <div className='rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200'>
                <Trans id='This article cannot be loaded because the database connection is unavailable. Configure DATABASE_URL and redeploy to restore blog content.' />
              </div>
            )}
            <p>
              <Trans id='The requested article is no longer available.' />
            </p>
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

  if (!isDatabaseConfigured) {
    return {
      props: {
        article: null,
        databaseReady: false,
      },
    }
  }

  try {
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
        },
        databaseReady: true,
      }
    }
  } catch (error) {
    console.error('[Blog] Error loading article:', error)
    return {
      props: {
        article: null,
        databaseReady: false,
      },
    }
  }
}

export default BlogPost
