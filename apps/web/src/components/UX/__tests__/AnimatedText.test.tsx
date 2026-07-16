import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnimatedText } from '../Animations/AnimatedText';

describe('AnimatedText', () => {
  it('renders the first beat with accessible controls', () => {
    const html = renderToStaticMarkup(<AnimatedText beats={[{ id: 'a', text: 'Welcome executives.' }]} reducedMotion />);

    expect(html).toContain('Welcome executives.');
    expect(html).toContain('>Pause</button>');
  });
});
