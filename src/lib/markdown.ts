import { marked, Renderer } from 'marked';

// Custom renderer: add id to headings for TOC anchors
const renderer = new Renderer();
renderer.heading = function ({ text, depth }) {
  const slug = text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
};

marked.setOptions({ gfm: true, breaks: true });
marked.use({ renderer });

// Convert standalone URLs into rich embeds (YouTube, Twitter/X, CodePen)
function preprocessEmbeds(content: string): string {
  return content.replace(/^(https?:\/\/[^\s<>]+)\s*$/gm, (url) => {
    // YouTube: youtube.com/watch?v=ID or youtu.be/ID
    const yt = url.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (yt) {
      return `<div class="embed-youtube not-prose"><iframe src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen loading="lazy" title="YouTube video" frameborder="0"></iframe></div>`;
    }

    // Twitter / X
    const tw = url.match(/(?:twitter|x)\.com\/\w+\/status\/(\d+)/);
    if (tw) {
      return `<div class="embed-tweet not-prose"><blockquote class="twitter-tweet" data-theme="dark"><a href="${url}">Ver tweet →</a></blockquote></div>`;
    }

    // CodePen
    const cp = url.match(/codepen\.io\/([^/\s]+)\/pen\/([a-zA-Z0-9]+)/);
    if (cp) {
      return `<div class="embed-codepen not-prose"><iframe src="https://codepen.io/${cp[1]}/embed/${cp[2]}?default-tab=result&theme-id=dark" allowfullscreen loading="lazy" title="CodePen" frameborder="0"></iframe></div>`;
    }

    return url;
  });
}

export function renderMarkdown(content: string): string {
  const processed = preprocessEmbeds(content);
  const result = marked.parse(processed);
  return typeof result === 'string' ? result : '';
}

export function hasTwitterEmbed(html: string): boolean {
  return html.includes('twitter-tweet');
}

export function extractHeadings(content: string): { depth: number; text: string; slug: string }[] {
  const headings: { depth: number; text: string; slug: string }[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const depth = match[1].length;
      const text = match[2].trim();
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      headings.push({ depth, text, slug });
    }
  }
  return headings;
}
