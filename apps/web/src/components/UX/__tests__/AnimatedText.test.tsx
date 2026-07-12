import { render, screen } from '@testing-library/react';
import { AnimatedText } from '../Animations/AnimatedText';

describe('AnimatedText', () => {
  it('renders the first beat with accessible controls', () => {
    render(<AnimatedText beats={[{ id: 'a', text: 'Welcome executives.' }]} />);
    expect(screen.getByText('Welcome executives.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });
});
