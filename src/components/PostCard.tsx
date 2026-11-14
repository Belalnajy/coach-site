import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { dict, fill } from '@/lib/i18n';
import { blogCategories } from '@/lib/config';
import { formatDate } from '@/lib/format';
import { href } from '@/lib/routes';
import type { Post } from '@/lib/posts';
import Icon from './Icon';

export const readingTime = (lang: Locale, minutes: number) => (minutes === 1 ? dict(lang).blog.minute : fill(dict(lang).blog.minutes, { n: minutes }));

/** Only the fields a card needs, so the client-side filter list stays small. */
export type PostSummary = Pick<Post, 'slug' | 'date' | 'category' | 'cover' | 'title' | 'excerpt' | 'minutes'>;

export default function PostCard({ post, lang, headingLevel = 3 }: { post: PostSummary; lang: Locale; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const category = blogCategories.find((c) => c.id === post.category)?.label[lang];
  return (
    <article className="group card relative flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-accent/60">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
        <Image src={post.cover} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        {category && <span className="absolute start-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-bold text-white backdrop-blur">{category}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Heading className="text-xl leading-snug font-black text-balance">
          <Link href={href(lang, `/blog/${post.slug}`)} className="after:absolute after:inset-0 after:content-['']">
            {post.title[lang]}
          </Link>
        </Heading>
        <p className="text-pretty text-muted">{post.excerpt[lang]}</p>
        <p className="mt-auto flex items-center gap-3 pt-2 text-sm text-muted">
          <time dateTime={post.date}>{formatDate(lang, post.date)}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={15} />
            {readingTime(lang, post.minutes[lang])}
          </span>
        </p>
      </div>
    </article>
  );
}

