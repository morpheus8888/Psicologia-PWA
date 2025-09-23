import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import sanitizeHtml from 'sanitize-html'
import { Trans, useLingui } from '@lingui/react'

import Page from '@/components/page'
import Section from '@/components/section'
import { prisma } from '@/lib/prisma'

type ArticleCard = {
  id: string
  slug: string
  title: string
  summary: string | null
  excerpt: string
  publishedAt: string
  authorEmail: string
}

type HomeProps = {
  articles: ArticleCard[]
}

const Home = ({ articles }: HomeProps) => {
  const { i18n } = useLingui()

  return (
    <Page>
      <Section>
        <div className='mx-auto max-w-4xl space-y-10'>
          <header className='text-center space-y-4'>
            <h1 className='text-3xl font-semibold text-zinc-900 dark:text-zinc-100'>
              <Trans id='Latest insights from the community' />
            </h1>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>
              <Trans id='Explore articles curated by the administrative team to support your wellbeing journey.' />
            </p>
          </header>

          {articles.length === 0 ? (
            <div className='rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-300'>
              <Trans id='No articles have been published yet. Check back soon!' />
            </div>
          ) : (
            <div className='space-y-6'>
              {articles.map((article) => (
                <article key={article.id} className='rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800'>
                  <div className='flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400'>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    <span>{article.authorEmail}</span>
                  </div>
                  <h2 className='mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100'>
                    <Link href={`/blog/${article.slug}`} className='hover:underline'>
                      {article.title}
                    </Link>
                  </h2>
                  <p className='mt-3 text-sm text-zinc-600 dark:text-zinc-300'>
                    {article.summary || article.excerpt}
                  </p>
                  <div className='mt-4 flex items-center gap-3'>
                    <Link
                      href={`/blog/${article.slug}`}
                      className='rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-indigo-600'
                    >
                      <Trans id='Read article' />
                    </Link>
                    <span className='text-xs text-zinc-400 dark:text-zinc-500'>
                      {i18n._('{words} words', { words: Math.max(80, Math.round(article.excerpt.split(' ').length)) })}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Section>
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { email: true } } },
  })

  const mapped = articles.map((article) => {
    const plainText = sanitizeHtml(article.content, { allowedTags: [], allowedAttributes: {} })
    const excerpt = plainText.replace(/\s+/g, ' ').trim().slice(0, 280)
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      excerpt,
      publishedAt: article.publishedAt?.toISOString() ?? article.createdAt.toISOString(),
      authorEmail: article.author.email,
    }
  })

  return {
    props: {
      articles: mapped,
    },
  }
}

export default Home
