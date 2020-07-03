/**
 * Integration test
 */

import React from 'react';
import App from '../App.xstate';
import { render, wait, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchDictWordsByTag as mockFetchDictWordsByTag } from '../utils';
// import { act } from 'react-dom/test-utils';

// Do not display console log
jest.mock('../utils')

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation();
});

afterAll(() => {
  console.log.mockRestore();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('App `start` state', () => {
  test('App should render search `input` & `button`', () => {
    const { getByText, getByPlaceholderText } = render(<App />);

    expect(getByText(/search/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/Search words by ur tags/i)).toBeInTheDocument();
  });
});

describe('App `loading` state', () => {
  let container;
  let button;
  const tag = 'a';

  beforeEach(async () => {
    container = render(<App />);
    const dom = await typeChar(container, tag);

    button = dom.button;
  });

  test('search button\'s text should change to `Searching`', async () => {
    expect(button).toHaveTextContent(/searching\.{3}/i);
  });

  test('ui should display cancel button', async () => {
    const { queryByTestId } = container;
    expect(queryByTestId('btn-cancel')).toBeInTheDocument();
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

  test('fetchDictWordsByTag should be trigger once', () => {
    expect(mockFetchDictWordsByTag).toHaveBeenCalledWith(tag);
    expect(mockFetchDictWordsByTag).toHaveBeenCalledTimes(1);
  });
});


describe('App `gallery` state', () => {
  let container;
  const tag = 'a';
  const data = [
    {
      title: 'dog',
      description: 'That was a pretty good dog',
      id: '#001'
    },
    {
      title: 'dragon',
      description: 'Dragon can fly and breathe fire',
      id: '#002'
    },
  ];

  test('search button\'s text should restore to `Search`', async () => {
    mockFetchDictWordsByTag.mockResolvedValue(data);
    container = render(<App />);
    const { button } = await typeChar(container, tag);
    
    expect(mockFetchDictWordsByTag).toHaveBeenCalledWith(tag);
    expect(mockFetchDictWordsByTag).toHaveBeenCalledTimes(1);
    await wait(() => {
      expect(button).toHaveTextContent(/Search$/);
    })
  })
});

async function typeChar(container, tag) {
  const { getByTestId } = container;
  const button = getByTestId('btn-search');
  const input = getByTestId('search-input');

  await userEvent.type(input, tag);

  userEvent.click(button);

  return { button, input };
}