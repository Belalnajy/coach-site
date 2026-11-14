/**
 * A deliberately small Markdown reader for the blog: headings (## and ###),
 * paragraphs, bullet and numbered lists, block quotes, **bold**, *italic*
 * and [links](https://…). It returns plain data that a React component
 * renders, so no HTML from a content file ever reaches the page unescaped.
 */

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'em'; text: string }
  | { type: 'link'; text: string; href: string };

export type Block =
  | { type: 'h2' | 'h3' | 'p' | 'quote'; content: Inline[] }
  | { type: 'ul' | 'ol'; items: Inline[][] };

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export const parseInline = (source: string): Inline[] => {
  const out: Inline[] = [];
  let last = 0;
  for (const match of source.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > last) out.push({ type: 'text', text: source.slice(last, at) });
    if (match[1] !== undefined) out.push({ type: 'strong', text: match[1] });
    else if (match[2] !== undefined) out.push({ type: 'em', text: match[2] });
    else out.push({ type: 'link', text: match[3], href: match[4] });
    last = at + match[0].length;
  }
  if (last < source.length) out.push({ type: 'text', text: source.slice(last) });
  return out;
};

export const parseMarkdown = (source: string): Block[] => {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { type: 'ul' | 'ol'; items: Inline[][] } | null = null;
  let quote: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'p', content: parseInline(paragraph.join(' ')) });
    if (list) blocks.push(list);
    if (quote.length) blocks.push({ type: 'quote', content: parseInline(quote.join(' ')) });
    paragraph = [];
    list = null;
    quote = [];
  };

  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    const quoted = /^>\s?(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: heading[1].length === 2 ? 'h2' : 'h3', content: parseInline(heading[2]) });
    } else if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      if (paragraph.length || quote.length || (list && list.type !== type)) flush();
      list ??= { type, items: [] };
      list.items.push(parseInline((bullet ?? numbered)![1]));
    } else if (quoted) {
      if (paragraph.length || list) flush();
      quote.push(quoted[1]);
    } else {
      if (list || quote.length) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
};

/** Plain text of the blocks, for word counts and descriptions. */
export const plainText = (blocks: Block[]): string =>
  blocks
    .flatMap((b) => ('items' in b ? b.items.flat() : b.content))
    .map((i) => i.text)
    .join(' ');
