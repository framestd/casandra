import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

export const highlight: NonNullable<MarkdownIt.Options['highlight']> = (str, lang, attrs) => {
  if (!lang || hljs.getLanguage(lang) === undefined) return '';
  try {
    const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true });
    return `<pre class="hljs" ${attrs}><code class="language-${lang}">${highlighted.value}</code></pre>`;
  } catch (e) {
    console.error('Highlighting failed: %o', e);
  }
  return '';
};

export function markdown(body: string) {
  const md = new MarkdownIt('commonmark', {
    breaks: false,
    html: false,
    langPrefix: 'language-',
    linkify: true,
    typographer: true,
    highlight,
  });
  const rendered = md.render(body);
  return rendered;
}
