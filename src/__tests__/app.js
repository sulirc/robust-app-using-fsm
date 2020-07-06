/**
 * Integration test
 */
import React from 'react';
import App from '../App.xstate';
import { render, wait, act } from '@testing-library/react';
import { build, fake, sequence } from 'test-data-bot';
import user from '@testing-library/user-event';
import { fetchDictWordsByTag as mockFetchDictWordsByTag } from '../utils';

jest.mock('../utils');

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

async function renderWords(options = { preprocess: () => mockFetchDictWordsByTag.mockResolvedValueOnce(data) }) {
  options.preprocess();

  const container = render(<App />);
  const elements = await inputTagsAndSubmit(container, tag);

  return {
    ...container,
    ...elements
  };
}

async function renderFailWords(options = { preprocess: () => mockFetchDictWordsByTag.mockRejectedValueOnce(null) }) {
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

  await user.type(input, tag);

  user.click(button);

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

describe('App `error` state', () => {
  test('search button\'s text should change to `Try search again`', async () => {
    const { getByText } = await renderFailWords();
    expect(mockFetchDictWordsByTag).toHaveBeenCalledWith(tag);
    expect(mockFetchDictWordsByTag).toHaveBeenCalledTimes(1);

    await wait(() => {
      expect(getByText(/try search again$/i)).toBeInTheDocument();
    });
  });

  test('ui can search again when request failed', async () => {
    const { getByText } = await renderFailWords();
    await wait(() => {
      expect(getByText(/try search again$/i)).toBeInTheDocument();
    });
    await act(async () => {
      user.click(getByText(/try search again$/i));
    });
    await wait(() => {
      expect(getByText(/searching\.{3}$/i)).toBeInTheDocument();
    });
    expect(getByText(/loading\.{3}/i)).toBeInTheDocument();
  });
});

describe('App `photo` state', () => {

});