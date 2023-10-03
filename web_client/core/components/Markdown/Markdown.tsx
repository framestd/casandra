import { MarkdownRenderer, MarkdownRendererProps } from './MarkdownRenderer';
import './markdown.scss';

export const Markdown = ({ markdown }: MarkdownRendererProps) => {
  return <MarkdownRenderer markdown={markdown} />;
};
