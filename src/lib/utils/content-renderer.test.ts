import { lexicalToHtml } from './content-renderer';

const paragraph = (...children: object[]) => ({ type: 'paragraph', children });
const text = (value: string) => ({ type: 'text', text: value });
const blank = () => paragraph();
const editorState = (...children: object[]) => ({ root: { children } });

describe('lexicalToHtml blank paragraphs', () => {
  it('drops blank paragraphs after the last line of content', () => {
    const html = lexicalToHtml(editorState(paragraph(text('Final line.')), blank(), blank(), blank()));

    expect(html).toBe('<p>Final line.</p>');
  });

  it('drops blank paragraphs before the first line of content', () => {
    const html = lexicalToHtml(editorState(blank(), blank(), paragraph(text('Opening line.'))));

    expect(html).toBe('<p>Opening line.</p>');
  });

  it('treats a paragraph holding only line breaks or spaces as blank', () => {
    const html = lexicalToHtml(
      editorState(paragraph(text('Final line.')), paragraph({ type: 'linebreak' }), paragraph(text('   ')))
    );

    expect(html).toBe('<p>Final line.</p>');
  });

  it('keeps blank paragraphs between content, which writers use for spacing', () => {
    const html = lexicalToHtml(editorState(paragraph(text('One.')), blank(), paragraph(text('Two.'))));

    expect(html).toBe('<p>One.</p><p>&nbsp;</p><p>Two.</p>');
  });

  it('keeps a closing paragraph that holds only an image', () => {
    const html = lexicalToHtml(
      editorState(paragraph(text('Caption.')), paragraph({ type: 'image', src: 'https://example.com/a.jpg' }))
    );

    expect(html).toContain('https://example.com/a.jpg');
  });

  it('renders nothing for an article with only blank paragraphs', () => {
    expect(lexicalToHtml(editorState(blank(), blank()))).toBe('');
  });
});
