import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from '../Tabs';

describe('Tabs', () => {
  it('marca a aba ativa corretamente (list)', () => {
    render(<Tabs active="list" onChange={() => {}} />);
    const list = screen.getByText('Word list');
    const fav = screen.getByText('Favorites');
    expect(list.className).toMatch(/bg-gray-100/);
    expect(fav.className).not.toMatch(/bg-gray-100/);
  });

  it('marca a aba ativa corretamente (fav)', () => {
    render(<Tabs active="fav" onChange={() => {}} />);
    const list = screen.getByText('Word list');
    const fav = screen.getByText('Favorites');
    expect(fav.className).toMatch(/bg-gray-100/);
    expect(list.className).not.toMatch(/bg-gray-100/);
  });

  it('dispara onChange ao clicar nas abas', () => {
    const onChange = vi.fn();
    render(<Tabs active="list" onChange={onChange} />);
    fireEvent.click(screen.getByText('Favorites'));
    expect(onChange).toHaveBeenCalledWith('fav');
    fireEvent.click(screen.getByText('Word list'));
    expect(onChange).toHaveBeenCalledWith('list');
  });
});
