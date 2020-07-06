/**
 * Integration test
 */
import React from 'react';
import App from '../App.xstate';
import { render, wait } from '@testing-library/react';
import { build, fake, sequence } from 'test-data-bot';
import userEvent from '@testing-library/user-event';
import { fetchDictWordsByTag as mockFetchDictWordsByTag } from '../utils';

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

const createFakeWord = build('words').fields({
  id: sequence(s => `card-${s}`),
  title: fake(f => f.lorem.word()),
  description: fake(f => f.lorem.sentence())
});

const tag = 'a';
const data = [
  createFakeWord(), createFakeWord()
];

async function renderWords(options = { preprocess: () => mockFetchDictWordsByTag.mockResolvedValue(data) }) {
  options.preprocess();

  const container = render(<App />);
  const elements = await inputTagsAndSubmit(container, tag);

  return {
    ...container,
    ...elements
  };
}

async function inputTagsAndSubmit(container, tag) {
  const { getByTestId } = container;
  const button = getByTestId('btn-search');
  const input = getByTestId('search-input');

  await userEvent.type(input, tag);

  userEvent.click(button);

  return { button, input };
}

describe('App `start` state', () => {
  test('App should render search `input` & `button`', () => {
    const { getByText, getByPlaceholderText } = render(<App />);

    expect(getByText(/search/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/Search words by ur tags/i)).toBeInTheDocument();
  });
});

describe('App `loading` state', () => {
  async function renderInput() {
    return await renderWords({
      preprocess: () => { }
    })
  }

  test('search button\'s text should change to `Searching`', async () => {
    const { button } = await renderInput();
    expect(button).toHaveTextContent(/searching\.{3}/i);
  });

  test('ui should display cancel button', async () => {
    const { queryByTestId } = await renderInput();
    expect(queryByTestId('btn-cancel')).toBeInTheDocument();
  });

  test('ui should display loading tips', async () => {
    const { queryByText } = await renderInput();
    expect(queryByText(/loading\.{3}/i)).toBeInTheDocument();
  });

  test('ui should no display cards-container', async () => {
    const { queryByTestId } = await renderInput();
    expect(queryByTestId('cards-container')).not.toBeInTheDocument();
  });

  test('ui should no display zoom-container', async () => {
    const { queryByTestId } = await renderInput();
    expect(queryByTestId('zoom-container')).not.toBeInTheDocument();
  });

  test('fetchDictWordsByTag should be trigger once', async () => {
    await renderInput();
    expect(mockFetchDictWordsByTag).toHaveBeenCalledWith(tag);
    expect(mockFetchDictWordsByTag).toHaveBeenCalledTimes(1);
  });
});

describe('App `gallery` state', () => {
  test('search button\'s text should restore to `Search`', async () => {
    const { button } = await renderWords();

    expect(mockFetchDictWordsByTag).toHaveBeenCalledWith(tag);
    expect(mockFetchDictWordsByTag).toHaveBeenCalledTimes(1);

    await wait(() => {
      expect(button).toHaveTextContent(/Search$/);
    })
  });

  test('ui should have render exactly number of cards', async () => {
    const { getByTestId } = await renderWords();

    await wait(() => {
      expect(getByTestId('words-container')).toBeInTheDocument();
    });
    expect(getByTestId('words-container').children.length).toEqual(data.length);
  });

  test('ui should only render words container', async () => {
    const { getByTestId, queryByTestId } = await renderWords();

    await wait(() => {
      expect(getByTestId('words-container')).toBeInTheDocument();
    });
    expect(queryByTestId('zoom-container')).not.toBeInTheDocument();
  });
});