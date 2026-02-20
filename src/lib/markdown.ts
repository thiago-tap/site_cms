import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: true });

export function renderMarkdown(content: string): string {
  const result = marked.parse(content);
  return typeof result === 'string' ? result : '';
}
