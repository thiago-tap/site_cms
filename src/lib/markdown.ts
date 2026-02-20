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

export function renderMarkdown(content: string): string {
  const result = marked.parse(content);
  return typeof result === 'string' ? result : '';
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
