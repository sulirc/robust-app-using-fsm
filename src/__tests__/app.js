/**
 * Integration test
 */

import React from 'react';
import App from '../App.xstate';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

describe('App start state', () => {
  test('App should render search `input` & `button`', () => {
    const { getByText, getByPlaceholderText } = render(<App />);

    expect(getByText(/search/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/Search words by ur tags/i)).toBeInTheDocument();
  });
});

describe('App loading state', () => {
  let container;

  async function typeChar() {
    const { getByText, getByPlaceholderText } = container;
    const button = getByText(/search/i);
    const input = getByPlaceholderText(/Search words by ur tags/i);

    await userEvent.type(input, 'a');

    userEvent.click(button);

    return { input, button };
  }

  beforeEach(() => {
    container = render(<App />);
  });

  test('searching button should change to `Searching`', async () => {
    const { button } = await typeChar();

    expect(button).toHaveTextContent(/searching\.{3}/i);
  });

  test('ui should display loading tips', async () => {
    await typeChar();
    const { queryByText } = container;

    expect(queryByText(/loading\.{3}/i)).toBeInTheDocument();
  });
});
