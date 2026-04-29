import { remark } from 'remark';
import remarkHtml from 'remark-html';

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(remarkHtml).process(markdown);
  return result.toString();
}

export function getExcerpt(content: string, length: number = 160): string {
  // Remove markdown syntax antes de criar o resumo
  const plainText = content
    .replace(/[#*_`\[\]()]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length).trim() + '...';
}
