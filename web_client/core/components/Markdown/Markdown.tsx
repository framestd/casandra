import { MarkdownRenderer, MarkdownRendererProps } from './MarkdownRenderer';
import './markdown.scss';

export const Markdown = (props: MarkdownRendererProps) => {
  return <MarkdownRenderer {...props} />;
};
