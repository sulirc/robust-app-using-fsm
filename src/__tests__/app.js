/**
 * Integration test
 */

import React from 'react';
import App from '../App.xstate';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Do not display console log
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

afterAll(() => {
  mockConsoleLog.mockRestore();
});

describe('App start state', () => {
  test('App should render search `input` & `button`', () => {
    const { getByText, getByPlaceholderText } = render(<App />);

    expect(getByText(/search/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/Search words by ur tags/i)).toBeInTheDocument();
  });
});

describe('App loading state', () => {
  let container;
  let button;
  let input;

  async function typeChar() {
    const { getByText, getByPlaceholderText } = container;

    button = getByText(/search/i);
    input = getByPlaceholderText(/Search words by ur tags/i);

    await userEvent.type(input, 'a');

    userEvent.click(button);
  }

  beforeEach(async () => {
    container = render(<App />);
    await typeChar();
  });

  test('searching button should change to `Searching`', async () => {
    expect(button).toHaveTextContent(/searching\.{3}/i);
  });

  test('ui should display cancel button', async () => {
    const { queryByText } = container;
    expect(queryByText(/cancel/i)).toBeInTheDocument();
  });

  test('ui should display loading tips', async () => {
    const { queryByText } = container;
    expect(queryByText(/loading\.{3}/i)).toBeInTheDocument();
  });

  test('ui should no display cards-container', async () => {
    const { queryByTestId } = container;
    expect(queryByTestId('cards-container')).not.toBeInTheDocument();
  });

  test('ui should no display zoom-container', async () => {
    const { queryByTestId } = container;
    expect(queryByTestId('zoom-container')).not.toBeInTheDocument();
  });
});